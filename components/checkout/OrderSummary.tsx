"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import type { CartItem } from "@/redux/cartSlice";
import type { VoucherCheck } from "@/lib/api/types";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";

function Row({
  label,
  value,
  muted = false,
}: {
  label: ReactNode;
  value: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className={`tabular-nums ${muted ? "text-zinc-400" : ""}`}>{value}</dd>
    </div>
  );
}

/**
 * The checkout's right-hand card: what is being bought, the voucher, the
 * price breakdown and the pay button.
 */
export default function OrderSummary({
  items,
  subtotal,
  voucher,
  voucherField,
  isPickup,
  shippingCost,
  total,
  canPay,
  paying,
  onPay,
}: {
  items: CartItem[];
  subtotal: number;
  voucher: VoucherCheck | null;
  /** The voucher input, rendered between the items and the totals. */
  voucherField: ReactNode;
  isPickup: boolean;
  /** Null until a delivery service is chosen. */
  shippingCost: number | null;
  total: number;
  canPay: boolean;
  paying: boolean;
  onPay: () => void;
}) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const savings = items.reduce(
    (sum, item) => sum + Math.max(0, item.price - item.finalPrice) * item.quantity,
    0,
  );

  return (
    <div className="border border-zinc-200 bg-white">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4 border-b border-zinc-200 px-5 py-4 md:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
          Order summary
          <span className="ml-2 font-normal normal-case tracking-normal text-zinc-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </h2>
        <Link
          href="/cart"
          className="text-xs text-zinc-500 underline underline-offset-4 hover:text-black"
        >
          Edit
        </Link>
      </div>

      {/* Items */}
      <ul className="max-h-[22rem] divide-y divide-zinc-100 overflow-y-auto px-5 md:px-6">
        {items.map((item) => (
          <li key={item.productSizeId} className="flex gap-3 py-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-zinc-100">
              <Image
                src={item.thumbnailUrl}
                alt={formatProductName(item.name)}
                fill
                sizes="4rem"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm leading-snug">
                {formatProductName(item.name)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {formatProductName(item.colorName)} · {item.size} · Qty{" "}
                {item.quantity}
              </p>
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="tabular-nums">
                {formatToIdr(item.finalPrice * item.quantity)}
              </p>
              {item.finalPrice < item.price && (
                <p className="text-xs tabular-nums text-zinc-400 line-through">
                  {formatToIdr(item.price * item.quantity)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Voucher */}
      <div className="border-t border-zinc-200 bg-zinc-50/60 px-5 py-4 md:px-6">
        {voucherField}
      </div>

      {/* Totals */}
      <dl className="space-y-2.5 border-t border-zinc-200 px-5 py-4 text-sm md:px-6">
        <Row label="Subtotal" value={formatToIdr(subtotal)} />
        {voucher && (
          <Row
            label={
              <>
                Voucher{" "}
                <span className="ml-1 border border-dashed border-emerald-600 px-1.5 py-px text-[0.6875rem] font-semibold tracking-wide text-emerald-700">
                  {voucher.code}
                </span>
              </>
            }
            value={
              <span className="text-emerald-700">
                −{formatToIdr(voucher.discount_amount)}
              </span>
            }
          />
        )}
        <Row
          label={isPickup ? "Store pickup" : "Shipping"}
          value={
            isPickup
              ? "Free"
              : shippingCost === null
                ? "Choose a service"
                : formatToIdr(shippingCost)
          }
          muted={!isPickup && shippingCost === null}
        />
      </dl>

      <div className="border-t border-zinc-200 px-5 py-4 md:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-xl font-semibold tabular-nums">
            {formatToIdr(total)}
          </span>
        </div>
        {(savings > 0 || voucher) && (
          <p className="mt-1 text-right text-xs text-emerald-700">
            You save {formatToIdr(savings + (voucher?.discount_amount ?? 0))}
          </p>
        )}

        <button
          type="button"
          onClick={onPay}
          disabled={paying || !canPay}
          className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-black px-4 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {paying ? (
            <Loader2 size="0.875rem" className="animate-spin" />
          ) : (
            <Lock size="0.875rem" />
          )}
          {paying ? "Processing…" : `Pay ${formatToIdr(total)}`}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.6875rem] text-zinc-500">
          <ShieldCheck size="0.875rem" />
          Secure payment via Midtrans
        </p>
      </div>
    </div>
  );
}
