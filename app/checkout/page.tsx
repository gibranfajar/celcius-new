"use client";

import { useEffect, useState } from "react";
import ModalShippingAddress from "@/components/ModalShippingAddress";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { clearCart } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

type ShippingService = {
  name: string;
  service: string;
  cost: number;
};

export default function CheckoutPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [shippingMethod, setShippingMethod] = useState<"home" | "pickup" | "">(
    "home",
  );
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState<any>(null);

  const [servicesByIndex, setServicesByIndex] = useState<any>({});
  const [selectedServices, setSelectedServices] = useState<
    Record<number, ShippingService>
  >({});

  const servicesArray = Object.values(selectedServices || {});

  // ===============================
  //     TOTAL SHIPPING COST (HOME DELIVERY)
  // ===============================
  const totalShipping = Object.values(selectedServices || {}).reduce(
    (acc: number, item: any) => acc + (item?.cost || 0),
    0,
  );

  // ==============================
  //    STORE PICKUP AVAILABILITY
  // ==============================
  const uniqueStores = new Set(cartItems?.map((item) => item.store));
  const canPickup = uniqueStores.size === 1;

  const firstItem = cartItems[0];
  const storeName = canPickup ? firstItem?.storeName : null;
  const lat = firstItem?.latitude;
  const lng = firstItem?.longitude;

  // ==============================
  //       LOAD USER PROFILE
  // ==============================
  useEffect(() => {
    if (!token) return;

    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const { data: user } = await axios.get(`${BASE_URL}user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // set base address info
        setAddress({
          userId: user.id,
          fullName: user.name,
          phone: user.phone_number,
          postalCode: user.postal_code,
          address: user.address,

          provinceId: user.province,
          cityId: user.city,
          districtId: user.district,

          provinceName: "",
          cityName: "",
          districtName: "",
        });

        // fetch province → city → district names
        loadLocationNames(user.province, user.city, user.district);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Ambil nama provinsi, kota, kecamatan dari ID
  const loadLocationNames = async (
    provId: string,
    cityId: string,
    distId: string,
  ) => {
    try {
      setIsLoading(true);
      const citiesRes = await axios.get(`${BASE_URL}cities/${provId}`);
      const districtsRes = await axios.get(`${BASE_URL}districts/${cityId}`);

      const city = citiesRes.data.find((c: any) => c.id == cityId);
      const district = districtsRes.data.find((d: any) => d.id == distId);

      // NOTE: province name ideally from provinces list API
      // but user only has ID, so quick fetch:
      const provRes = await axios.get(`${BASE_URL}provinces`);
      const province = provRes.data.find((p: any) => p.id == provId);

      setAddress((prev: any) => ({
        ...prev,
        provinceName: province?.name || "",
        cityName: city?.name || "",
        districtName: district?.name || "",
      }));
    } catch (error) {
      setIsLoading(false);
      console.error("Error loading location names:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  //       CALCULATE SUBTOTAL
  // ==============================
  const subtotal = cartItems?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ==============================
  //     FETCH COURIER SERVICES
  // ==============================
  const handleCourierChange = async (e: any, index: number) => {
    const courier = e.target.value;

    if (!address?.districtId) return;

    // RESET service lama di index ini
    setSelectedServices((prev: any) => {
      const updated = { ...prev };
      delete updated[index]; // ⛔ hapus biar gak ikut ke total
      return updated;
    });

    try {
      const { data } = await axios.get(
        `${BASE_URL}cost/${address.districtId}/1000/${courier}`,
      );

      setServicesByIndex((prev: any) => ({
        ...prev,
        [index]: data.data,
      }));
    } catch (error) {
      console.error("Error fetching delivery services:", error);
    }
  };

  // Disable checkout button jika ada item yang belum pilih layanan (untuk home delivery)
  const isAllSelected = cartItems.every((_, i) => selectedServices[i]?.service);

  // ==============================
  //       CHECKOUT PROCESS
  // ==============================
  const buildOrderPayload = () => {
    const isHome = shippingMethod === "home";

    const orderType = isHome ? "HOME DELIVERY" : "PICKUP";

    const products = cartItems?.map((item) => {
      const fixPrice = item.price - (item.discount || 0);
      const weightTotal = (item.weight || 0) * item.quantity;

      return {
        id: item.id,
        name: item.name,
        article: item.article,
        plu: item.plu,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        storeId: item.store,
        storeName: item.storeName,
        price: item.price,
        discount: item.discount || 0,
        fix_price: fixPrice,
        weight: weightTotal,
        total: fixPrice * item.quantity,
      };
    });

    // BUILD SHIPPING DETAILS
    const shippingDetails = isHome
      ? Object.entries(selectedServices).map(([index, s]: any) => ({
          storeId: cartItems[Number(index)]?.store, // ambil dari cart
          courier: s.name,
          service: s.service,
          cost: s.cost,
        }))
      : [];

    const totalShipping = shippingDetails.reduce(
      (acc, s) => acc + Number(s.cost || 0),
      0,
    );

    const payload = {
      orderType,

      userId: address?.userId || "",
      name: address?.fullName || "",
      phone: address?.phone || "",

      address: isHome ? address?.address : null,
      postalCode: isHome ? address?.postalCode : null,
      province: isHome ? address?.provinceName : null,
      city: isHome ? address?.cityName : null,
      district: isHome ? address?.districtName : null,

      shippingDetails,

      products,

      discount: 0,

      totalWeight: products.reduce((sum, p) => sum + p.weight, 0),

      total: subtotal + totalShipping,
    };

    return payload;
  };

  // ==============================
  //       RESET SERVICE
  // ==============================
  useEffect(() => {
    if (shippingMethod === "pickup") {
      setSelectedServices({}); // reset service saat pilih "pickup"
      setServicesByIndex({}); // reset opsi layanan saat pilih "pickup"
      return;
    }

    if (shippingMethod === "home") {
      setSelectedServices({}); // reset service saat kembali ke "home"
    }
  }, [shippingMethod]);

  // ==============================
  //       HANDLE CHECKOUT
  // ==============================
  useEffect(() => {
    if (window.snap) return;

    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    );
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleCheckout = async () => {
    if (!token) {
      toast.error("Please log in to proceed with checkout.");
      router.push("/login");
      return;
    }

    const isHome = shippingMethod === "home";

    // ===== VALIDATION (tetap sama) =====
    if (!address?.fullName || !address?.phone) {
      return toast.error("Full name and phone number are required.");
    }

    if (isHome) {
      if (!address?.address)
        return toast.error("Shipping address cannot be empty.");
      if (!address?.postalCode) return toast.error("Postal code is required.");
      if (
        !address?.provinceName ||
        !address?.cityName ||
        !address?.districtName
      ) {
        return toast.error(
          "Please complete your province, city, and district details.",
        );
      }
      if (!selectedServices) {
        return toast.error("Please select a courier and delivery service.");
      }
    }

    if (!isHome && !canPickup) {
      return toast.error(
        "Store pickup is not available for items from multiple stores.",
      );
    }

    const payload = buildOrderPayload();

    try {
      setButtonLoading(true);
      const token = localStorage.getItem("token");

      // 1️⃣ CREATE ORDER & GET SNAP TOKEN
      const res = await axios.post(`${BASE_URL}order`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { snap_token } = res.data;

      if (!snap_token) {
        return toast.error("Failed to get payment token");
      }

      window.snap.pay(snap_token, {
        onSuccess: function (result: any) {
          toast.success("Payment successful 🎉");
          dispatch(clearCart());
          router.push("/orders");
        },

        onPending: function (result: any) {
          toast("Waiting for payment ⏳", { icon: "⏳" });
          dispatch(clearCart());
          router.push("/");
        },

        onError: function (result: any) {
          dispatch(clearCart());
          toast.error("Payment failed ❌");
        },

        onClose: function () {
          dispatch(clearCart());
          toast("Payment popup closed", { icon: "⚠️" });
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed");
    } finally {
      setButtonLoading(false);
    }
  };

  // ==============================
  //             RENDER
  // ==============================
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader size={40} color="#000" />
      </div>
    );

  // ==============================
  //             RENDER UI
  // ==============================
  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="bg-white border shadow-sm p-6 space-y-6">
          {/* SHIPPING OPTIONS */}
          <h2 className="font-semibold text-lg border-b pb-2">
            SHIPPING OPTIONS
          </h2>

          {/* HOME DELIVERY */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="shipping_method"
                checked={shippingMethod === "home"}
                onChange={() => setShippingMethod("home")}
                className="accent-black"
              />
              <span className="text-sm font-medium">Home Delivery</span>
            </label>

            {shippingMethod === "home" && (
              <div className="border p-4 space-y-4">
                {/* ADDRESS */}
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Shipping To:
                    <br />
                    {address ? (
                      <>
                        {address.fullName} <br />
                        {address.address}, {address.districtName},{" "}
                        {address.cityName}, {address.provinceName}{" "}
                        {address.postalCode} <br />
                        {address.phone}
                      </>
                    ) : (
                      "No address added yet."
                    )}
                  </p>

                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-3 px-4 py-2 bg-black text-white text-xs hover:bg-gray-800 cursor-pointer"
                  >
                    {address ? "MODIFY ADDRESS" : "ADD ADDRESS"}
                  </button>
                </div>

                {showModal && (
                  <ModalShippingAddress
                    setShowModal={setShowModal}
                    onSave={setAddress}
                    data={address}
                  />
                )}

                {/* SHIPPING SERVICES */}
                {cartItems?.map((item, index) => (
                  <div key={index}>
                    <span>
                      Shipping from {formatProductName(item.storeName)}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Courier
                        </label>
                        <select
                          onChange={(e) => handleCourierChange(e, index)}
                          className="w-full border px-3 py-2 text-sm"
                        >
                          <option value="">-- Please Select --</option>
                          <option value="sicepat">SiCepat</option>
                          <option value="jne">JNE</option>
                          <option value="jnt">J&T</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Delivery Service
                        </label>
                        <select
                          value={selectedServices[index]?.service || ""}
                          onChange={(e) => {
                            const selected = servicesByIndex[index]?.find(
                              (s: any) => s.service === e.target.value,
                            );

                            setSelectedServices((prev: any) => ({
                              ...prev,
                              [index]: { ...selected },
                            }));
                          }}
                          className="w-full border px-3 py-2 text-sm"
                        >
                          <option value="">-- Please Select --</option>
                          {servicesByIndex[index]?.map((s: any, i: number) => (
                            <option key={i} value={s.service}>
                              {s.service} — {s.description} (
                              {formatToIdr(s.cost)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr />

          {/* STORE PICKUP */}
          <div className="space-y-1">
            <label
              className={`flex items-center space-x-2 ${
                canPickup ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`}
            >
              <input
                type="radio"
                name="shipping_method"
                disabled={!canPickup}
                checked={shippingMethod === "pickup"}
                onChange={() => canPickup && setShippingMethod("pickup")}
                className="accent-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium">Store Pickup</span>
            </label>

            {!canPickup && (
              <p className="text-xs text-red-600 ml-6">
                Pickup not available because your items come from multiple
                stores.
              </p>
            )}

            {shippingMethod === "pickup" && canPickup && (
              <div className="border p-4 text-sm text-gray-700 space-y-3">
                <p>
                  <span className="font-semibold">Branch Store:</span>{" "}
                  {storeName}
                </p>

                <iframe
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* PRODUCTS */}
          <div className="bg-white border shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">PRODUCTS</h2>

            {cartItems?.map((item, index) => (
              <div className="flex justify-between text-sm" key={index}>
                <p>
                  {formatProductName(item.name)} ({item.size}) x {item.quantity}
                </p>
                <p>{formatToIdr(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white border shadow-sm p-6 space-y-3">
            <h2 className="font-semibold text-lg border-b pb-2">
              ORDER SUMMARY
            </h2>

            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Order Subtotal</p>
              <p>{formatToIdr(subtotal)}</p>
            </div>

            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Shipping</p>
              <p>{formatToIdr(totalShipping)}</p>
            </div>

            <hr />

            <div className="flex justify-between font-semibold text-sm">
              <p>Total</p>
              <p>{formatToIdr(subtotal + totalShipping)}</p>
            </div>
          </div>

          {/* NEXT BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleCheckout}
              disabled={
                shippingMethod === "home"
                  ? !isAllSelected
                  : false || buttonLoading
              }
              className={`text-center bg-black text-white px-6 py-3 text-sm w-1/2 border hover:bg-white hover:text-black hover:border-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {buttonLoading ? "Loading..." : "CHECKOUT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
