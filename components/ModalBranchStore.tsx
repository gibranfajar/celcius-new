"use client";

import { useEffect, useState } from "react";
import { X, MapPin, User } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addToCart, updateCartStore } from "@/redux/cartSlice";
import toast from "react-hot-toast";
import getDistanceLocation from "@/lib/getDistanceLocation";

interface ModalBranchStoreProps {
  onClose: () => void;
  onRequestLocation: () => Promise<void>;
  isLocationLoading?: boolean;
  userLocation?: {
    alamat_lengkap?: string;
    kota?: string;
    negara?: string;
    provinsi?: string;
    longitude?: number;
    latitude?: number;
  } | null;
  locationError?: boolean;
  dataProduct: {
    id: string;
    name: string;
    article: string;
    size: string;
    color: string;
    price: number;
    image: string;
    fix_price: number;
    weight: number;
    store: string;
    plu: string;
  };
}

interface BranchStore {
  store_id: string;
  brand: string;
  kota: string;
  provinsi: string;
  qty: number;
  plu: string;
  latitude: number;
  longitude: number;
}

export default function ModalBranchStore({
  onClose,
  userLocation,
  dataProduct,
}: ModalBranchStoreProps) {
  const dispatch = useDispatch<AppDispatch>();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [userProvinceName, setUserProvinceName] = useState<string | null>(null);

  const [allBranchData, setAllBranchData] = useState<BranchStore[]>([]);
  const [branchWithDistance, setBranchWithDistance] = useState<any[]>([]);
  const [nearestStore, setNearestStore] = useState<string | null>(null);

  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedPLU, setSelectedPLU] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"location" | "profile">(
    "location",
  );

  const [search, setSearch] = useState("");

  const hasLocation = userLocation?.latitude && userLocation?.longitude;

  const locationText =
    userLocation?.alamat_lengkap ||
    [userLocation?.kota, userLocation?.provinsi].filter(Boolean).join(", ") ||
    "ALL";

  // LOCK BODY SCROLL WHEN MODAL OPEN
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ──────────────────────────────────────────────
  // FETCH USER DATA
  // ───────────────────────────────────────────────
  const fetchProvinceName = async (provId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}provinces`);
      const list = response.data;

      const match = list.find((p: any) => String(p.id) === String(provId));

      return match ? match.name : null;
    } catch (err) {
      console.error("Failed to fetch provinces:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!token) return;
    const loadUserProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data;
        // convert province ID to province NAME
        const provName = await fetchProvinceName(user.province);
        setUserProvinceName(provName); // <- simpan nama provinsi
      } catch (err) {
        console.error(err);
      }
    };

    loadUserProfile();
  }, [token]);

  // ───────────────────────────────────────────────
  // FETCH ALL (NO PROVINCE)
  // ───────────────────────────────────────────────
  const fetchAllBranchData = async () => {
    try {
      const response = await axios.get(
        "https://golangapi-j5iu.onrender.com/api/global/stock/o/",
        {
          params: {
            article: dataProduct.article,
            size: dataProduct.size,
            color: dataProduct.color,
            provinsi: "ALL",
          },
        },
      );

      const raw = response.data.itemDetail || [];
      setAllBranchData(raw);

      // Default filter based on user location
      applyFilter(raw, userLocation?.provinsi || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllBranchData();
  }, [dataProduct]);

  // ───────────────────────────────────────────────
  // FE FILTER FUNCTION
  // ───────────────────────────────────────────────
  const applyFilter = (source: BranchStore[], keyword: string = "") => {
    const k = keyword.toLowerCase().trim();

    const filtered = source.filter((store) =>
      [
        store.provinsi.toLowerCase(),
        store.kota.toLowerCase(),
        store.brand.toLowerCase(),
      ].some((v) => v.includes(k)),
    );

    // Add distance if user has location
    if (userLocation?.longitude && userLocation?.latitude) {
      const mapped = filtered.map((s) => ({
        ...s,
        distance: getDistanceLocation(
          userLocation.latitude!,
          userLocation.longitude!,
          s.latitude,
          s.longitude,
        ),
      }));

      mapped.sort((a, b) => a.distance - b.distance);

      if (mapped.length > 0) {
        setNearestStore(mapped[0].store_id);
      }

      setBranchWithDistance(mapped);
      return;
    }

    setBranchWithDistance(filtered);
  };

  // ───────────────────────────────────────────────
  // TAB SWITCH
  // ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (activeTab === "profile") {
      if (!token) {
        toast.error("You must login to use your profile location.");
        setActiveTab("location");
        return;
      }

      applyFilter(allBranchData, userProvinceName?.toUpperCase() || "ALL");
    }

    if (activeTab === "location") {
      applyFilter(allBranchData, userLocation?.provinsi || "");
    }
  }, [activeTab, allBranchData]);

  // ───────────────────────────────────────────────
  // SEARCH FE ONLY
  // ───────────────────────────────────────────────
  const handleSearch = () => {
    if (!search.trim()) return;
    applyFilter(allBranchData, search);
  };

  // ───────────────────────────────────────────────
  // CONFIRM ADD TO CART
  // ───────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedStore) return toast.error("Please select a branch.");

    const store = branchWithDistance.find((s) => s.store_id === selectedStore);
    if (!store) return;

    const merged = {
      ...dataProduct,
      store: selectedStore,
      storeName: `${store.brand} ${store.kota}`,
      plu: selectedPLU,
      latitude: store.latitude,
      longitude: store.longitude,
    };

    try {
      if (dataProduct.store) {
        dispatch(
          updateCartStore({
            id: dataProduct.id,
            oldStore: dataProduct.store,
            newStore: selectedStore,
            newStoreName: merged.storeName,
            newPLU: selectedPLU,
            latitude: store.latitude,
            longitude: store.longitude,
          }),
        );
        toast.success("Branch updated!");
      } else {
        dispatch(addToCart(merged));
        toast.success("Added to cart!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      onClose();
    }
  };

  // ───────────────────────────────────────────────
  // MAIN UI
  // ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[98vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b px-5 py-4">
          <h2 className="text-lg font-semibold">SELECT BRANCH STORE</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY (NO SCROLL) */}
        <div className="p-5 space-y-4 text-sm">
          {/* TABS */}
          <div className="flex border overflow-hidden">
            <button
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-2 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "location"
                  ? "bg-black text-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <MapPin size={16} /> Use My Location
            </button>

            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                if (!token)
                  return toast.error("Please login to use your profile.");
                setActiveTab("profile");
              }}
              className={`flex-1 py-2 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-black text-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <User size={16} /> Based on Profile
            </button>
          </div>

          {/* LOCATION TEXT */}
          {activeTab === "location" && (
            <>
              {userLocation?.latitude && userLocation?.longitude ? (
                <p className="text-xs text-gray-500">
                  Your location:{" "}
                  <span className="font-medium">{locationText}</span>
                </p>
              ) : (
                <div className="border border-dashed p-4 text-center space-y-4">
                  <p className="text-xs text-gray-600">
                    Location access is disabled. Enable location to find nearby
                    stores.
                  </p>
                  <span className="text-xs bg-black text-white px-4 py-2 mb-4">
                    Please refresh and allow location access
                  </span>
                </div>
              )}
            </>
          )}

          {hasLocation && (
            <>
              {/* SEARCH */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Find branch store... (province or city)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 border px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="bg-black text-white px-4 py-2 text-xs cursor-pointer"
                >
                  SEARCH
                </button>
              </div>
            </>
          )}
        </div>

        {hasLocation && (
          <>
            {/* STORE LIST — ONLY SCROLLABLE PART */}
            <div className="px-5 pb-5">
              <div className="divide-y border max-h-64 overflow-y-auto">
                {branchWithDistance.length > 0 ? (
                  branchWithDistance.map((store) => {
                    const isSelected = store.store_id === selectedStore;

                    return (
                      <div
                        key={store.store_id}
                        onClick={() => {
                          setSelectedStore(store.store_id);
                          setSelectedPLU(store.plu);
                        }}
                        className={`py-3 px-3 cursor-pointer transition ${
                          isSelected
                            ? "border-l-4 border-black bg-gray-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">
                            {store.brand} {store.kota}
                          </h3>

                          {userLocation?.latitude &&
                            userLocation?.longitude && (
                              <span className="text-xs text-gray-600">
                                {store.distance?.toFixed(1)} km{" "}
                                {store.store_id === nearestStore &&
                                  store.distance <= 5 && (
                                    <span className="text-blue-600 font-medium">
                                      (Nearest)
                                    </span>
                                  )}
                              </span>
                            )}
                        </div>

                        <p className="text-xs text-gray-500">10:00 - 22:00</p>

                        <p className="text-xs text-gray-700">
                          Available Stock:{" "}
                          <span
                            className={`font-semibold ${
                              store.qty > 2 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {store.qty}
                          </span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-gray-500 text-sm">
                    No stores found for this filter.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* FOOTER (ALWAYS VISIBLE WHEN SELECTED) */}
        {selectedStore && (
          <div className="border-t p-4 bg-white">
            <button
              onClick={handleConfirm}
              className="bg-black text-white w-full py-2 text-xs cursor-pointer"
            >
              CONFIRM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
