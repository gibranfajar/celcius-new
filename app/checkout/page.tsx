"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import ModalShippingAddress, {
  ShippingAddressForm,
} from "@/components/ModalShippingAddress";
import StoreMapCard from "@/components/StoreMapCard";
import OrderSummary from "@/components/checkout/OrderSummary";
import VoucherField from "@/components/checkout/VoucherField";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatToIdr } from "@/lib/formatToIdr";
import toast from "react-hot-toast";
import {
  Check,
  Loader2,
  ShoppingBag,
  Store,
  TriangleAlert,
  Truck,
} from "lucide-react";
import { clearCart } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";
import { listAddresses, getShippingCost, submitCheckout } from "@/lib/api";
import type { CheckoutPayload } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import {
  FulfillmentMethod,
  ShippingRate,
  UserAddress,
  VoucherCheck,
} from "@/lib/api/types";
import { Skeleton } from "@/components/SkeletonImage";

const COURIERS = ["jne", "jnt", "sicepat"];

const inputClass =
  "w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-400 focus:border-black";

function Section({
  step,
  title,
  aside,
  children,
}: {
  step: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-zinc-200 py-7 first:pt-0 last:border-b-0">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[0.6875rem] text-white">
            {step}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function MethodOption({
  active,
  icon,
  title,
  description,
  onSelect,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`relative flex cursor-pointer items-start gap-3 border p-4 text-left transition ${
        active
          ? "border-black bg-zinc-50 ring-1 ring-black"
          : "border-zinc-200 hover:border-zinc-400"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${
          active ? "bg-black text-white" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
          {description}
        </span>
      </span>
      {active && (
        <Check size="1rem" className="absolute right-3 top-3" aria-hidden />
      )}
    </button>
  );
}

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [method, setMethod] = useState<FulfillmentMethod>("shipping");

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [manualAddress, setManualAddress] =
    useState<ShippingAddressForm | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [voucher, setVoucher] = useState<VoucherCheck | null>(null);

  const [pickupName, setPickupName] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  const isPickup = method === "pickup";

  // The person collecting a pickup order defaults to the account holder.
  useEffect(() => {
    if (!user) return;
    setPickupName((current) => current || user.name);
    setPickupPhone((current) => current || user.phone_number || "");
  }, [user]);

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

  // A pickup order is collected at one store, so every item has to come
  // from the same store.
  const pickupStores = useMemo(() => {
    const stores = new Map<string, (typeof cartItems)[number]>();
    for (const item of cartItems) {
      if (item.storeCode && !stores.has(item.storeCode)) {
        stores.set(item.storeCode, item);
      }
    }
    return [...stores.values()];
  }, [cartItems]);
  const pickupStore = pickupStores.length === 1 ? pickupStores[0] : null;

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
  const shippingCost = isPickup ? 0 : (selectedRate?.cost ?? 0);
  const discount = voucher?.discount_amount ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;
  const voucherItems = useMemo(
    () =>
      cartItems.map((item) => ({
        product_size_id: item.productSizeId,
        quantity: item.quantity,
      })),
    [cartItems],
  );

  useEffect(() => {
    if (isPickup || !destination || totalWeight <= 0) {
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
  }, [isPickup, destination, totalWeight]);

  const canSubmit = isPickup
    ? Boolean(pickupStore && pickupName.trim() && pickupPhone.trim())
    : Boolean(selectedRate);

  const buildPayload = (): CheckoutPayload | null => {
    const items = cartItems.map((item) => ({
      product_size_id: item.productSizeId,
      quantity: item.quantity,
      store_code: item.storeCode ?? null,
    }));
    const common = {
      shipping_email: token ? undefined : guestEmail,
      voucher_code: voucher?.code,
      notes: notes || undefined,
      items,
    };

    if (isPickup) {
      if (!pickupStore?.storeCode) {
        toast.error("Pickup needs every item from the same store.");
        return null;
      }
      if (!pickupName.trim() || !pickupPhone.trim()) {
        toast.error("Please fill in who will pick up the order.");
        return null;
      }

      return {
        ...common,
        fulfillment_method: "pickup",
        pickup_store_code: pickupStore.storeCode,
        shipping_receiver_name: pickupName.trim(),
        shipping_phone: pickupPhone.trim(),
      };
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
      return null;
    }

    if (!selectedRate) {
      toast.error("Please select a courier and delivery service.");
      return null;
    }

    return {
      ...common,
      fulfillment_method: "shipping",
      shipping_receiver_name: receiverName,
      shipping_phone: phone,
      shipping_address: address,
      shipping_province: province,
      shipping_city: city,
      shipping_district: district,
      shipping_postal_code: postalCode,
      shipping_cost: selectedRate.cost,
      courier_code: selectedRate.code,
      courier_service: selectedRate.service,
    };
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (cartItems.some((item) => !item.storeCode)) {
      toast.error("Choose a store for every item first.");
      router.push("/cart");
      return;
    }

    if (!token && !guestEmail) {
      toast.error("Please provide your email.");
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    try {
      setButtonLoading(true);

      const response = await submitCheckout(payload);

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
      <div className="mx-auto min-h-screen w-full max-w-[100rem] px-4 pb-16 pt-6 md:px-6 md:pt-8">
        <Skeleton className="mb-8 h-8 w-40" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10 xl:gap-14">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="seccond-font flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <ShoppingBag size="1.75rem" className="text-zinc-400" />
        </div>
        <div>
          <p className="base-font text-xl">Your cart is empty</p>
          <p className="mt-1.5 text-sm text-zinc-500">
            Add something to check out.
          </p>
        </div>
        <Link
          href="/"
          className="bg-black px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-zinc-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="seccond-font mx-auto min-h-screen w-full max-w-[100rem] px-4 pb-16 pt-6 md:px-6 md:pt-8">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-zinc-200 pb-5">
        <h1 className="base-font text-2xl md:text-3xl">Checkout</h1>
        <Link
          href="/cart"
          className="nav-link text-xs uppercase tracking-[0.15em] text-zinc-600 hover:text-black"
        >
          Back to cart
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10 xl:gap-14">
        {/* LEFT */}
        <div>
          <Section step={1} title="How do you want your order?">
            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
              <MethodOption
                active={!isPickup}
                icon={<Truck size="1.125rem" />}
                title="Delivery"
                description="Shipped to your address by courier."
                onSelect={() => setMethod("shipping")}
              />
              <MethodOption
                active={isPickup}
                icon={<Store size="1.125rem" />}
                title="Pick up in store"
                description="Collect it yourself, free of shipping."
                onSelect={() => setMethod("pickup")}
              />
            </div>
          </Section>

          {isPickup ? (
            <>
              <Section step={2} title="Pickup store">
                {pickupStore ? (
                  <StoreMapCard
                    code={pickupStore.storeCode}
                    showMap={
                      pickupStore.storeLatitude != null ||
                      Boolean(pickupStore.storeAddress)
                    }
                    store={{
                      name: pickupStore.storeName ?? pickupStore.storeCode ?? "",
                      address: pickupStore.storeAddress,
                      latitude: pickupStore.storeLatitude,
                      longitude: pickupStore.storeLongitude,
                      mapsUrl: pickupStore.storeMapsUrl,
                    }}
                  />
                ) : (
                  <div className="flex items-start gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <TriangleAlert size="1rem" className="mt-0.5 shrink-0" />
                    <div>
                      <p>
                        Your items come from {pickupStores.length} different
                        stores (
                        {pickupStores.map((item) => item.storeName).join(", ")}
                        ). To pick up, every item has to come from one store.
                      </p>
                      <Link
                        href="/cart"
                        className="mt-2 inline-block font-semibold underline underline-offset-4"
                      >
                        Change stores in your cart
                      </Link>
                    </div>
                  </div>
                )}
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  We&apos;ll email you when your order is ready. Bring your
                  order number when you come to the store.
                </p>
              </Section>

              <Section step={3} title="Who will pick it up?">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      type="text"
                      value={pickupName}
                      onChange={(e) => setPickupName(e.target.value)}
                      className={inputClass}
                      placeholder="Name on the order"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Mobile phone">
                    <input
                      type="tel"
                      value={pickupPhone}
                      onChange={(e) => setPickupPhone(e.target.value)}
                      className={inputClass}
                      placeholder="08xxxxxxxxxx"
                      autoComplete="tel"
                    />
                  </Field>
                  {!token && (
                    <div className="sm:col-span-2">
                      <Field label="Email">
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className={inputClass}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </Section>
            </>
          ) : (
            <>
              <Section
                step={2}
                title="Shipping address"
                aside={
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="cursor-pointer text-xs font-semibold underline underline-offset-4 hover:text-zinc-600"
                  >
                    {token
                      ? "Use a different address"
                      : manualAddress
                        ? "Edit address"
                        : "Add address"}
                  </button>
                }
              >
                {!token && (
                  <div className="mb-4">
                    <Field label="Email">
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className={inputClass}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </Field>
                  </div>
                )}

                {token && savedAddresses.length > 0 && (
                  <div className="space-y-2" role="radiogroup">
                    {savedAddresses.map((addr) => {
                      const active = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setManualAddress(null);
                          }}
                          className={`flex w-full cursor-pointer items-start gap-3 border p-4 text-left text-sm transition ${
                            active
                              ? "border-black bg-zinc-50"
                              : "border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              active ? "border-black" : "border-zinc-300"
                            }`}
                          >
                            {active && (
                              <span className="h-2 w-2 rounded-full bg-black" />
                            )}
                          </span>
                          <span className="leading-relaxed">
                            <span className="font-semibold">
                              {addr.receiver_name}
                            </span>{" "}
                            <span className="text-zinc-500">
                              · {addr.phone_number}
                            </span>
                            <br />
                            <span className="text-zinc-600">
                              {addr.address}, {addr.district}, {addr.city},{" "}
                              {addr.province} {addr.postal_code}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {manualAddress && (
                  <div className="mt-2 border border-black bg-zinc-50 p-4 text-sm leading-relaxed">
                    <span className="font-semibold">
                      {manualAddress.receiverName}
                    </span>{" "}
                    <span className="text-zinc-500">· {manualAddress.phone}</span>
                    <br />
                    <span className="text-zinc-600">
                      {manualAddress.address}, {manualAddress.districtName},{" "}
                      {manualAddress.cityName}, {manualAddress.provinceName}{" "}
                      {manualAddress.postalCode}
                    </span>
                  </div>
                )}

                {!manualAddress && !selectedAddress && (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="w-full cursor-pointer border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 hover:border-black hover:text-black"
                  >
                    + Add a shipping address
                  </button>
                )}
              </Section>

              <Section step={3} title="Delivery service">
                {!destination ? (
                  <p className="text-sm text-zinc-500">
                    Add your shipping address to see delivery options.
                  </p>
                ) : ratesLoading ? (
                  <p className="flex items-center gap-2 text-sm text-zinc-500">
                    <Loader2 size="0.875rem" className="animate-spin" />
                    Loading delivery options…
                  </p>
                ) : rates.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No delivery options available for this address.
                  </p>
                ) : (
                  <div className="space-y-2" role="radiogroup">
                    {rates.map((rate, index) => {
                      const active =
                        selectedRate?.service === rate.service &&
                        selectedRate?.code === rate.code;
                      return (
                        <button
                          key={`${rate.code}-${rate.service}-${index}`}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedRate(rate)}
                          className={`flex w-full cursor-pointer items-center justify-between gap-4 border p-4 text-left text-sm transition ${
                            active
                              ? "border-black bg-zinc-50"
                              : "border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                active ? "border-black" : "border-zinc-300"
                              }`}
                            >
                              {active && (
                                <span className="h-2 w-2 rounded-full bg-black" />
                              )}
                            </span>
                            <span>
                              <span className="font-semibold uppercase">
                                {rate.name}
                              </span>{" "}
                              · {rate.service}
                              <span className="block text-xs text-zinc-500">
                                {rate.description}
                              </span>
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {formatToIdr(rate.cost)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Section>
            </>
          )}

          <Section step={4} title="Notes">
            <Field label="Anything we should know? (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder={
                  isPickup
                    ? "e.g. I'll pick it up on Saturday"
                    : "e.g. leave it at the front desk"
                }
              />
            </Field>
          </Section>

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
        </div>

        {/* RIGHT: summary */}
        <aside className="h-fit lg:sticky lg:top-[calc(var(--nav-h,4rem)+1.5rem)]">
          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
            voucher={voucher}
            voucherField={
              <VoucherField
                items={voucherItems}
                subtotal={subtotal}
                applied={voucher}
                onChange={setVoucher}
                signedIn={Boolean(token)}
              />
            }
            isPickup={isPickup}
            shippingCost={isPickup ? 0 : (selectedRate?.cost ?? null)}
            total={total}
            canPay={canSubmit}
            paying={buttonLoading}
            onPay={handleCheckout}
          />
        </aside>
      </div>
    </div>
  );
}
