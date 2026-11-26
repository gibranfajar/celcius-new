"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { checkVoucher, getErrorMessage, listVouchers } from "@/lib/api";
import type { UserVoucher, VoucherCheck } from "@/lib/api/types";
import { formatToIdr } from "@/lib/formatToIdr";

type CheckItem = { product_size_id: number; quantity: number };

/** "10% off (up to Rp 50.000)" or "Rp 25.000 off". */
export function describeVoucher(
  voucher: Pick<VoucherCheck, "discount_type" | "discount_value" | "max_discount">,
): string {
  if (voucher.discount_type === "percent") {
    const cap = voucher.max_discount
      ? ` (up to ${formatToIdr(voucher.max_discount)})`
      : "";
    return `${Number(voucher.discount_value)}% off${cap}`;
  }
  return `${formatToIdr(voucher.discount_value)} off`;
}

function isUsable(voucher: UserVoucher): boolean {
  return (
    !voucher.is_used &&
    (!voucher.expired_at || new Date(voucher.expired_at) > new Date())
  );
}

/**
 * Voucher entry for checkout: the code is checked against the cart right
 * away, so the discount shows in the summary before paying. Signed-in
 * shoppers also see their own vouchers to apply with one tap.
 */
export default function VoucherField({
  items,
  subtotal,
  applied,
  onChange,
  signedIn,
}: {
  items: CheckItem[];
  subtotal: number;
  applied: VoucherCheck | null;
  onChange: (voucher: VoucherCheck | null) => void;
  signedIn: boolean;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const itemsKey = useMemo(() => JSON.stringify(items), [items]);
  // Read inside the re-check below without re-running it.
  const latest = useRef({ applied, onChange });
  useEffect(() => {
    latest.current = { applied, onChange };
  });

  useEffect(() => {
    if (!signedIn) {
      setMyVouchers([]);
      return;
    }
    listVouchers()
      .then((vouchers) => setMyVouchers(vouchers.filter(isUsable)))
      .catch((loadError) => console.error("Error fetching vouchers:", loadError));
  }, [signedIn]);

  // The cart can change under an applied voucher (an item removed, a
  // quantity lowered), so it is priced again; one that no longer applies
  // is taken off with the reason.
  useEffect(() => {
    const { applied: current, onChange: update } = latest.current;
    if (!current) return;

    let cancelled = false;
    checkVoucher(current.code, JSON.parse(itemsKey) as CheckItem[])
      .then((result) => {
        if (!cancelled) update(result);
      })
      .catch((checkError) => {
        if (cancelled) return;
        update(null);
        setError(getErrorMessage(checkError));
      });

    return () => {
      cancelled = true;
    };
  }, [itemsKey]);

  const apply = async (voucherCode: string) => {
    const trimmed = voucherCode.trim();
    if (!trimmed) return;

    setChecking(true);
    setError(null);
    try {
      const result = await checkVoucher(trimmed, items);
      onChange(result);
      setCode("");
    } catch (checkError) {
      setError(getErrorMessage(checkError));
    } finally {
      setChecking(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 border border-dashed border-emerald-600 bg-emerald-50 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Tag size="0.875rem" className="shrink-0 text-emerald-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-emerald-900">
              {applied.code}
            </p>
            <p className="text-xs text-emerald-800">
              {describeVoucher(applied)} · you save{" "}
              {formatToIdr(applied.discount_amount)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setError(null);
          }}
          aria-label="Remove voucher"
          className="cursor-pointer p-1 text-emerald-800 hover:text-black"
        >
          <X size="1rem" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply(code);
        }}
        className="flex"
      >
        <label className="sr-only" htmlFor="voucher-code">
          Voucher code
        </label>
        <input
          id="voucher-code"
          type="text"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Voucher code"
          autoComplete="off"
          className={`min-w-0 flex-1 border bg-white px-3 py-2.5 text-sm uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-400 focus:border-black ${
            error ? "border-red-400" : "border-zinc-300"
          }`}
        />
        <button
          type="submit"
          disabled={!code.trim() || checking}
          className="flex w-24 shrink-0 cursor-pointer items-center justify-center border border-l-0 border-black bg-black text-xs uppercase tracking-[0.15em] text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300"
        >
          {checking ? <Loader2 size="0.875rem" className="animate-spin" /> : "Apply"}
        </button>
      </form>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {myVouchers.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[0.6875rem] uppercase tracking-[0.15em] text-zinc-500">
            Your vouchers
          </p>
          <div className="flex flex-wrap gap-2">
            {myVouchers.map((voucher) => {
              const shortBy = voucher.min_purchase - subtotal;

              return (
                <button
                  key={voucher.code}
                  type="button"
                  disabled={checking || shortBy > 0}
                  onClick={() => apply(voucher.code)}
                  title={
                    shortBy > 0
                      ? `Spend ${formatToIdr(shortBy)} more to use this voucher`
                      : undefined
                  }
                  className="flex cursor-pointer flex-col items-start border border-dashed border-zinc-400 px-3 py-1.5 text-left hover:border-black hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-zinc-400 disabled:hover:bg-transparent"
                >
                  <span className="text-xs font-semibold tracking-wide">
                    {voucher.code}
                  </span>
                  <span className="text-[0.6875rem] text-zinc-500">
                    {shortBy > 0
                      ? `Min. spend ${formatToIdr(voucher.min_purchase)}`
                      : describeVoucher(voucher)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
