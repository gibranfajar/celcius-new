"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { LogOut } from "lucide-react";
import Profile from "@/components/Profile";
import Order from "@/components/Order";
import Promo from "@/components/Promo";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/authSlice";

type OrderType = any;

export default function Dashboard() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<"profile" | "orders" | "promo">(
    "profile",
  );
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Laravel Sanctum biasanya kirim user di `user` atau langsung di root
        setUser(response.data.user || response.data);
      } catch (error: any) {
        console.error("Error fetching user:", error);

        // Jika token invalid/expired
        if (error.response && [401, 403].includes(error.response.status)) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${BASE_URL}logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-red-500">User tidak ditemukan.</div>;
  }

  const menuItems = ["Profile", "Orders", "Promo"];

  return (
    <div className="p-4 md:px-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div>
          <div className="mb-6">
            <span className="text-2xl font-semibold">Hi, {user.name}</span>
            <p className="text-sm text-zinc-600 mt-2">
              Manage your account settings and personal information.
            </p>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 mt-4 flex items-center gap-2 hover:underline cursor-pointer"
            >
              <LogOut className="size-4" />
              LOGOUT
            </button>
          </div>

          {/* Sidebar Menu */}
          <div className="flex flex-col gap-4 mt-8">
            {menuItems.map((item) => (
              <span
                key={item}
                className={`text-sm cursor-pointer border-b border-zinc-400 py-4 hover:font-semibold transition ${
                  active === item.toLowerCase() ? "font-semibold" : ""
                }`}
                onClick={() =>
                  setActive(
                    item.toLowerCase() as "profile" | "orders" | "promo",
                  )
                }
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 px-0 md:px-6">
          {active === "profile" && <Profile data={user} />}
          {active === "orders" && (
            <Order orders={orders} onCancelSuccess={fetchOrders} />
          )}
          {active === "promo" && <Promo />}
        </div>
      </div>
    </div>
  );
}
