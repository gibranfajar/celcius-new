"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { getMembershipPromos } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { MembershipPromo } from "@/lib/api/types";
import { Skeleton } from "@/components/SkeletonImage";

// The membership API returns dates as "DD/MM/YYYY" strings, which `new
// Date()` would misparse (JS defaults to MM/DD/YYYY) - parsed by hand instead.
function formatMembershipDate(value: string): string {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return value;

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PromoCard({ promo }: { promo: MembershipPromo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-200 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="font-medium text-sm">{promo.promoTitle}</p>
        {promo.brand && (
          <span className="text-[10px] tracking-wide font-medium px-1.5 py-0.5 bg-black text-white shrink-0">
            {promo.brand}
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        {formatMembershipDate(promo.promoStartDate)} –{" "}
        {formatMembershipDate(promo.promoEndDate)}
        {promo.promoLocation ? ` · ${promo.promoLocation}` : ""}
      </p>

      {promo.promoDetail && (
        <div className="text-xs text-zinc-600 whitespace-pre-line">
          {expanded
            ? promo.promoDetail
            : promo.promoDetail.length > 140
              ? `${promo.promoDetail.slice(0, 140)}...`
              : promo.promoDetail}
        </div>
      )}

      {promo.promoDetail.length > 140 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs underline cursor-pointer hover:text-zinc-500"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function Promo() {
  const [promos, setPromos] = useState<MembershipPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMembershipPromos();
        setPromos(data.filter((promo) => promo.isActive));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Promotions</h1>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 border border-zinc-200" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-500">⚠️ {error}</p>
      )}

      {!loading && !error && promos.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
          <Tag size={28} className="text-gray-300" />
          <p className="text-sm">
            You don&apos;t have any active promotions right now.
          </p>
        </div>
      )}

      {!loading && !error && promos.length > 0 && (
        <div className="space-y-3">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </div>
  );
}
