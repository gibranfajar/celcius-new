"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { RootState } from "@/redux/store";
import {
  CartItem,
  cartStoreFrom,
  changeStore,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/redux/cartSlice";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import type { StoreStock } from "@/lib/api/types";
import StorePickerModal from "@/components/product/StorePickerModal";

function productHref(item: CartItem): string | null {
  return item.productType ? `/products/${item.productType}/${item.slug}` : null;
}

function CartLine({
  item,
  onChangeStore,
}: {
  item: CartItem;
  onChangeStore: () => void;
}) {
  const dispatch = useDispatch();
  const href = productHref(item);
  const atMax = item.maxQuantity != null && item.quantity >= item.maxQuantity;
  const hasDiscount = item.finalPrice < item.price;

  const thumbnail = (
    <div className="relative aspect-square w-24 shrink-0 overflow-hidden bg-zinc-100 sm:w-32">
      <Image
        src={item.thumbnailUrl}
        alt={formatProductName(item.name)}
        fill
        sizes="8rem"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );

  return (
    <li className="flex gap-4 py-6 sm:gap-6">
      {href ? (
        <Link href={href} className="group">
          {thumbnail}
        </Link>
      ) : (
        thumbnail
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {href ? (
              <Link
                href={href}
                className="base-font line-clamp-2 text-base leading-snug hover:underline hover:underline-offset-4"
              >
                {formatProductName(item.name)}
              </Link>
            ) : (
              <p className="base-font line-clamp-2 text-base leading-snug">
                {formatProductName(item.name)}
              </p>
            )}
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-500">
              {formatProductName(item.colorName)} · Size {item.size}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums">
              {formatToIdr(item.finalPrice * item.quantity)}
            </p>
            {hasDiscount && (
              <p className="text-xs tabular-nums text-zinc-400 line-through">
                {formatToIdr(item.price * item.quantity)}
              </p>
            )}
          </div>
        </div>

        {/* Store */}
        {/* Store: one line that never wraps - a long name is cut short
            rather than pushing the button onto a line of its own. */}
        <div
          className={`mt-3 flex w-full max-w-sm items-center gap-2 border py-2 pl-3 pr-2 text-xs ${
            item.storeName
              ? "border-zinc-200 bg-zinc-50"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          {item.storeName ? (
            <>
              <Store size="0.875rem" className="shrink-0 text-zinc-500" />
              <span className="min-w-0 flex-1 truncate" title={item.storeName}>
                <span className="text-zinc-500">From </span>
                <span className="font-semibold">{item.storeName}</span>
              </span>
            </>
          ) : (
            <>
              <TriangleAlert size="0.875rem" className="shrink-0 text-amber-600" />
              <span className="min-w-0 flex-1 truncate text-amber-800">
                No store chosen
              </span>
            </>
          )}
          <button
            type="button"
            onClick={onChangeStore}
            aria-label={item.storeName ? "Change store" : "Choose store"}
            className="shrink-0 cursor-pointer px-1 font-semibold underline underline-offset-4 hover:text-zinc-600"
          >
            {item.storeName ? "Change" : "Choose"}
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div>
            <div className="inline-flex items-center border border-zinc-300">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() =>
                  dispatch(decrementQuantity({ productSizeId: item.productSizeId }))
                }
                disabled={item.quantity <= 1}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
              >
                <Minus size="0.875rem" />
              </button>
              <span className="w-9 text-center text-sm tabular-nums" aria-live="polite">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  dispatch(incrementQuantity({ productSizeId: item.productSizeId }))
                }
                disabled={atMax}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
              >
                <Plus size="0.875rem" />
              </button>
            </div>
            {atMax && (
              <p className="mt-1.5 text-[0.6875rem] text-red-600">
                Only {item.maxQuantity} in stock at this store
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(removeFromCart({ productSizeId: item.productSizeId }));
              toast.success("Removed from cart.");
            }}
            className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-500 hover:text-red-600"
          >
            <Trash2 size="0.875rem" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [storeItem, setStoreItem] = useState<CartItem | null>(null);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );
  const savings = cartItems.reduce(
    (sum, item) => sum + Math.max(0, item.price - item.finalPrice) * item.quantity,
    0,
  );
  const itemsWithoutStore = cartItems.filter((item) => !item.storeCode);

  const handleCheckout = () => {
    if (itemsWithoutStore.length > 0) {
      toast.error("Choose a store for every item first.");
      setStoreItem(itemsWithoutStore[0]);
      return;
    }
    router.push("/checkout");
  };

  const handleStorePicked = (store: StoreStock) => {
    if (!storeItem) return;

    dispatch(
      changeStore({
        productSizeId: storeItem.productSizeId,
        store: cartStoreFrom(store),
      }),
    );

    if (storeItem.quantity > store.qty) {
      toast(`Quantity lowered to ${store.qty}, all ${store.name} has.`);
    } else {
      toast.success(`Now from ${store.name}.`);
    }
    setStoreItem(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="seccond-font flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <ShoppingBag size="1.75rem" className="text-zinc-400" />
        </div>
        <div>
          <p className="base-font text-xl">Your cart is empty</p>
          <p className="mt-1.5 text-sm text-zinc-500">
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/products/men/list"
            className="bg-black px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-zinc-800"
          >
            Shop men
          </Link>
          <Link
            href="/products/women/list"
            className="border border-black px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white"
          >
            Shop women
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="seccond-font mx-auto min-h-screen w-full max-w-[100rem] px-4 pb-16 pt-6 md:px-6 md:pt-8">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="base-font text-2xl md:text-3xl">Shopping Cart</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/"
          className="nav-link hidden text-xs uppercase tracking-[0.15em] text-zinc-600 hover:text-black sm:inline"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 xl:gap-14">
        <div>
          {itemsWithoutStore.length > 0 && (
            <div className="mb-2 flex items-start gap-2 border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <TriangleAlert size="0.875rem" className="mt-0.5 shrink-0" />
              <p>
                {itemsWithoutStore.length === 1
                  ? "One item has"
                  : `${itemsWithoutStore.length} items have`}{" "}
                no store yet. Choose where to buy it from before checkout.
              </p>
            </div>
          )}

          <ul className="divide-y divide-zinc-200">
            {cartItems.map((item) => (
              <CartLine
                key={item.productSizeId}
                item={item}
                onChangeStore={() => setStoreItem(item)}
              />
            ))}
          </ul>
        </div>

        {/* Order summary */}
        <aside className="h-fit lg:sticky lg:top-[calc(var(--nav-h,4rem)+1.5rem)]">
          <div className="border border-zinc-200 p-5 md:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
              Order summary
            </h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="tabular-nums">{formatToIdr(total + savings)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Discount</dt>
                  <dd className="tabular-nums text-red-600">
                    −{formatToIdr(savings)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500">Shipping</dt>
                <dd className="text-zinc-500">Calculated at checkout</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-zinc-200 pt-4">
                <dt className="font-semibold">Total</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {formatToIdr(total)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCheckout}
              className="group mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-black px-4 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-zinc-800"
            >
              Checkout
              <ArrowRight
                size="0.875rem"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.6875rem] text-zinc-500">
              <ShieldCheck size="0.875rem" />
              Secure payment via Midtrans
            </p>
          </div>

          <Link
            href="/"
            className="mt-4 block text-center text-xs uppercase tracking-[0.15em] text-zinc-600 underline underline-offset-4 hover:text-black sm:hidden"
          >
            Continue shopping
          </Link>
        </aside>
      </div>

      <AnimatePresence>
        {storeItem && (
          <StorePickerModal
            key={storeItem.productSizeId}
            productSizeId={storeItem.productSizeId}
            description={`${formatProductName(storeItem.name)} · ${formatProductName(storeItem.colorName)} · Size ${storeItem.size}`}
            currentStoreCode={storeItem.storeCode}
            confirmLabel="Use store"
            onClose={() => setStoreItem(null)}
            onConfirm={handleStorePicked}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
