"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Package, Tag } from "lucide-react";
import Profile from "@/components/Profile";
import Order from "@/components/Order";
import Promo from "@/components/Promo";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout as logoutAction, setUser } from "@/redux/authSlice";
import { getProfile, logout as apiLogout } from "@/lib/api";
import { User } from "@/lib/api/types";
import { Skeleton } from "@/components/SkeletonImage";

type Tab = "profile" | "orders" | "promo";

const TABS: { id: Tab; label: string; icon: typeof UserIcon }[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "orders", label: "Orders", icon: Package },
  { id: "promo", label: "Promo", icon: Tag },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [user, setLocalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Tab>("profile");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const profile = await getProfile();
        setLocalUser(profile);
        dispatch(setUser(profile));
      } catch (error: unknown) {
        console.error("Error fetching profile:", error);
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number | null }).status;
          if (status === 401 || status === 403) {
            dispatch(logoutAction());
            router.push("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logoutAction());
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:px-8 md:py-8">
        <div className="grid md:grid-cols-[240px_1fr] gap-8 max-w-5xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-red-500">User tidak ditemukan.</div>;
  }

  return (
    <div className="p-4 md:px-8 md:py-8 seccond-font">
      <div className="grid md:grid-cols-[240px_1fr] gap-8 max-w-5xl mx-auto">
        {/* Sidebar */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Mobile: horizontal tabs */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 border-b border-zinc-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs tracking-wide cursor-pointer transition-colors ${
                  active === id
                    ? "bg-black text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <Icon size={13} />
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Desktop: vertical sidebar */}
          <div className="hidden md:flex flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm text-left cursor-pointer border-l-2 transition-colors ${
                  active === id
                    ? "border-black font-semibold bg-zinc-50"
                    : "border-transparent text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 mt-6 flex items-center gap-2 hover:underline cursor-pointer"
          >
            <LogOut size={15} />
            LOGOUT
          </button>
        </div>

        {/* Main Content */}
        <div className="min-w-0">
          {active === "profile" && (
            <Profile
              data={user}
              onUpdated={(updated) => {
                setLocalUser(updated);
                dispatch(setUser(updated));
              }}
            />
          )}
          {active === "orders" && <Order />}
          {active === "promo" && <Promo />}
        </div>
      </div>
    </div>
  );
}
