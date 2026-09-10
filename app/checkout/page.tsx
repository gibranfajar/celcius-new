"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import ModalShippingAddress, {
  ShippingAddressForm,
} from "@/components/ModalShippingAddress";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import toast from "react-hot-toast";
import { Loader2, ShoppingBag } from "lucide-react";
import { clearCart } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";
import { listAddresses, getShippingCost, submitCheckout } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { ShippingRate, UserAddress } from "@/lib/api/types";
import { Skeleton } from "@/components/SkeletonImage";

const COURIERS = ["jne", "jnt", "sicepat"];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [manualAddress, setManualAddress] =
    useState<ShippingAddressForm | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!token) return;

    const loadAddresses = async () => {
      setIsLoading(true);
      try {
        const addresses = await listAddresses();
        setSavedAddresses(addresses);
        const primary = addresses.find((a) => a.is_primary) ?? addresses[0];
        if (primary) setSelectedAddressId(primary.id);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [token]);

  const selectedAddress = useMemo(
    () => savedAddresses.find((a) => a.id === selectedAddressId) ?? null,
    [savedAddresses, selectedAddressId],
  );

  // RajaOngkir prices between two sub-districts, so that's what has to be
  // sent as the destination - both saved addresses and the manual form now
  // carry a subdistrict id.
  const destination =
    manualAddress?.subdistrictId ||
    (selectedAddress?.subdistrict_id
      ? String(selectedAddress.subdistrict_id)
      : null);

  const totalWeight = cartItems.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0,
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

  useEffect(() => {
    if (!destination || totalWeight <= 0) {
      setRates([]);
      setSelectedRate(null);
      return;
    }

    const fetchRates = async () => {
      setRatesLoading(true);
      setSelectedRate(null);
      try {
        const result = await getShippingCost({
          destination,
          weight: totalWeight,
          couriers: COURIERS,
        });
        setRates(result);
      } catch (error) {
        console.error("Error fetching shipping cost:", error);
        setRates([]);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [destination, totalWeight]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const receiverName =
      selectedAddress?.receiver_name || manualAddress?.receiverName;
    const phone = selectedAddress?.phone_number || manualAddress?.phone;
    const address = selectedAddress?.address || manualAddress?.address;
    const province = selectedAddress?.province || manualAddress?.provinceName;
    const city = selectedAddress?.city || manualAddress?.cityName;
    const district = selectedAddress?.district || manualAddress?.districtName;
    const postalCode =
      selectedAddress?.postal_code || manualAddress?.postalCode;

    if (
      !receiverName ||
      !phone ||
      !address ||
      !province ||
      !city ||
      !district ||
      !postalCode
    ) {
      toast.error("Please complete your shipping address.");
      return;
    }

    if (!token && !guestEmail) {
      toast.error("Please provide your email.");
      return;
    }

    if (!selectedRate) {
      toast.error("Please select a courier and delivery service.");
      return;
    }

    try {
      setButtonLoading(true);

      const response = await submitCheckout({
        shipping_receiver_name: receiverName,
        shipping_email: token ? undefined : guestEmail,
        shipping_phone: phone,
        shipping_address: address,
        shipping_province: province,
        shipping_city: city,
        shipping_district: district,
        shipping_postal_code: postalCode,
        shipping_cost: selectedRate.cost,
        courier_code: selectedRate.code,
        courier_service: selectedRate.service,
        voucher_code: voucherCode || undefined,
        notes: notes || undefined,
        items: cartItems.map((item) => ({
          product_size_id: item.productSizeId,
          quantity: item.quantity,
        })),
      });

      if (!response.snap_token) {
        toast.error("Failed to get payment token");
        return;
      }

      // The order is already persisted on the backend at this point, so the
      // cart must be cleared now - not inside the Snap callbacks below, which
      // never fire if the user closes the tab/browser before finishing (or
      // dismissing) the payment popup, leaving stale items in the cart.
      dispatch(clearCart());

      if (typeof window === "undefined" || !window.snap) {
        toast.error(
          "Payment service is not ready yet. You can finish payment anytime from your orders.",
        );
        router.push("/dashboard");
        return;
      }

      window.snap.pay(response.snap_token, {
        onSuccess: () => {
          toast.success("Payment successful 🎉");
          router.push("/dashboard");
        },
        onPending: () => {
          toast("Waiting for payment ⏳", { icon: "⏳" });
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Payment failed ❌");
        },
        onClose: () => {
          toast("Payment popup closed", { icon: "⚠️" });
        },
      });
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setButtonLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border p-6 space-y-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-6">
            <div className="bg-white border p-6 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag size={32} className="text-gray-300" />
        <div>
          <p className="font-medium text-zinc-700">Your cart is empty.</p>
          <p className="text-sm text-zinc-500 mt-1">
            Add something to check out.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-block bg-black text-white text-xs tracking-wide font-medium px-6 py-3 hover:bg-zinc-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto">
        {/* LEFT SIDE */}
        <div className="bg-white border border-zinc-200 p-6 space-y-6">
          <h2 className="font-semibold text-lg border-b pb-2">
            SHIPPING ADDRESS
          </h2>

          {!token && (
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border border-zinc-300 px-3 py-2 text-sm focus:border-black"
                placeholder="you@example.com"
              />
            </div>
          )}

          {token && savedAddresses.length > 0 && (
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-2 border p-3 cursor-pointer text-sm ${
                    selectedAddressId === addr.id
                      ? "border-black"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="saved_address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => {
                      setSelectedAddressId(addr.id);
                      setManualAddress(null);
                    }}
                    className="mt-1 accent-black"
                  />
                  <span>
                    <span className="font-medium">{addr.receiver_name}</span> (
                    {addr.phone_number})
                    <br />
                    {addr.address}, {addr.district}, {addr.city},{" "}
                    {addr.province} {addr.postal_code}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {manualAddress ? (
                <>
                  {manualAddress.receiverName} <br />
                  {manualAddress.address}, {manualAddress.districtName},{" "}
                  {manualAddress.cityName}, {manualAddress.provinceName}{" "}
                  {manualAddress.postalCode} <br />
                  {manualAddress.phone}
                </>
              ) : !selectedAddress ? (
                "No address added yet."
              ) : null}
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-3 px-4 py-2 bg-black text-white text-xs hover:bg-gray-800 cursor-pointer"
            >
              {token
                ? "USE A DIFFERENT ADDRESS"
                : manualAddress
                  ? "MODIFY ADDRESS"
                  : "ADD ADDRESS"}
            </button>
          </div>

          <AnimatePresence>
            {showModal && (
              <ModalShippingAddress
                key="shipping-address-modal"
                setShowModal={setShowModal}
                onSave={(form) => {
                  setManualAddress(form);
                  setSelectedAddressId(null);
                }}
                data={manualAddress}
              />
            )}
          </AnimatePresence>

          <hr />

          <h2 className="font-semibold text-lg border-b pb-2">
            SHIPPING SERVICE
          </h2>

          {!destination && (
            <p className="text-sm text-gray-500">
              Complete your shipping address to see delivery options.
            </p>
          )}

          {destination && ratesLoading && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Loading delivery options...
            </p>
          )}

          {destination && !ratesLoading && (
            <div className="space-y-2">
              {rates.length === 0 && (
                <p className="text-sm text-gray-500">
                  No delivery options available.
                </p>
              )}
              {rates.map((rate, index) => (
                <label
                  key={`${rate.code}-${rate.service}-${index}`}
                  className={`flex items-center justify-between border p-3 cursor-pointer text-sm ${
                    selectedRate?.service === rate.service &&
                    selectedRate?.code === rate.code
                      ? "border-black"
                      : "border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="courier_rate"
                      checked={
                        selectedRate?.service === rate.service &&
                        selectedRate?.code === rate.code
                      }
                      onChange={() => setSelectedRate(rate)}
                      className="accent-black"
                    />
                    <span>
                      {rate.name} - {rate.service}
                      <br />
                      <span className="text-xs text-gray-500">
                        {rate.description}
                      </span>
                    </span>
                  </span>
                  <span className="font-medium">{formatToIdr(rate.cost)}</span>
                </label>
              ))}
            </div>
          )}

          <hr />

          <div>
            <label className="text-sm font-medium mb-2 block">
              Voucher Code
            </label>
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full border border-zinc-300 px-3 py-2 text-sm focus:border-black"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-zinc-300 px-3 py-2 text-sm focus:border-black"
              rows={2}
              placeholder="Optional"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6 md:sticky md:top-20 h-fit">
          {/* PRODUCTS */}
          <div className="bg-white border border-zinc-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">PRODUCTS</h2>

            {cartItems.map((item) => (
              <div
                className="flex justify-between text-sm gap-3"
                key={item.productSizeId}
              >
                <p className="min-w-0">
                  {formatProductName(item.name)} ({item.size}) × {item.quantity}
                </p>
                <p className="shrink-0">
                  {formatToIdr(item.finalPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white border border-zinc-200 p-6 space-y-3">
            <h2 className="font-semibold text-lg border-b pb-2">
              ORDER SUMMARY
            </h2>

            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Order Subtotal</p>
              <p>{formatToIdr(subtotal)}</p>
            </div>

            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Shipping</p>
              <p>{formatToIdr(selectedRate?.cost ?? 0)}</p>
            </div>

            <hr />

            <div className="flex justify-between font-semibold text-sm">
              <p>Total</p>
              <p>{formatToIdr(subtotal + (selectedRate?.cost ?? 0))}</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={buttonLoading || !selectedRate}
              className="w-full text-center bg-black text-white px-6 py-3 text-sm font-medium tracking-wide border border-black hover:bg-white hover:text-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {buttonLoading ? "Loading..." : "CHECKOUT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
