"use client";

import { Ticket } from "lucide-react";
import { Skeleton } from "@/components/SkeletonImage";
import { formatToIdr } from "@/lib/formatToIdr";
import { UserVoucher } from "@/lib/api/types";

type VoucherStatus = "active" | "used" | "expired";

function voucherStatus(voucher: UserVoucher): VoucherStatus {
  if (voucher.is_used) return "used";
  if (voucher.expired_at && new Date(voucher.expired_at) < new Date()) {
    return "expired";
  }
  return "active";
}

const STATUS_STYLES: Record<VoucherStatus, string> = {
  active: "bg-green-100 text-green-700",
  used: "bg-zinc-100 text-zinc-500",
  expired: "bg-red-50 text-red-500",
};

function discountLabel(voucher: UserVoucher): string {
  if (voucher.discount_type === "percent") {
    const cap = voucher.max_discount
      ? ` (up to ${formatToIdr(voucher.max_discount)})`
      : "";
    return `${voucher.discount_value}% OFF${cap}`;
  }
  return `${formatToIdr(voucher.discount_value)} OFF`;
}

function VoucherCard({ voucher }: { voucher: UserVoucher }) {
  const status = voucherStatus(voucher);

  return (
    <div
      className={`border p-4 flex items-center justify-between gap-3 ${
        status === "active" ? "border-zinc-200" : "border-zinc-100 opacity-60"
      }`}
    >
      <div className="min-w-0">
        <p className="font-semibold text-sm">{discountLabel(voucher)}</p>
        <p className="text-xs text-zinc-500 mt-1">
          Code: <span className="font-mono tracking-wide">{voucher.code}</span>
        </p>
        {voucher.min_purchase > 0 && (
          <p className="text-xs text-zinc-500">
            Min. purchase {formatToIdr(voucher.min_purchase)}
          </p>
        )}
        {voucher.expired_at && (
          <p className="text-xs text-zinc-400 mt-1">
            Valid until{" "}
            {new Date(voucher.expired_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <span
        className={`shrink-0 text-[10px] tracking-wide font-medium px-2 py-1 ${STATUS_STYLES[status]}`}
      >
        {status.toUpperCase()}
      </span>
    </div>
  );
}

export default function Voucher({
  vouchers,
  loading,
  error,
}: {
  vouchers: UserVoucher[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Vouchers</h1>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 border border-zinc-200" />
          ))}
        </div>
      )}

      {!loading && error && <p className="text-sm text-red-500">⚠️ {error}</p>}

      {!loading && !error && vouchers.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
          <Ticket size={28} className="text-gray-300" />
          <p className="text-sm">You don&apos;t have any vouchers yet.</p>
        </div>
      )}

      {!loading && !error && vouchers.length > 0 && (
        <div className="space-y-3">
          {vouchers.map((voucher, index) => (
            <VoucherCard key={`${voucher.code}-${index}`} voucher={voucher} />
          ))}
        </div>
      )}
    </div>
  );
}
