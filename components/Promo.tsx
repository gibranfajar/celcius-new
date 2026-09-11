"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Tag, X } from "lucide-react";
import { getMembershipPromos } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { MembershipPromo } from "@/lib/api/types";
import { promoImageUrl } from "@/lib/membershipAssetUrl";
import MobileSheetModal from "@/components/MobileSheetModal";
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

function PromoDetailModal({
  promo,
  onClose,
}: {
  promo: MembershipPromo;
  onClose: () => void;
}) {
  return (
    <MobileSheetModal
      onClose={onClose}
      className="sm:max-w-md max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-zinc-100 shrink-0">
        <h2 className="text-sm font-semibold">{promo.promoTitle}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0">
        {promo.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promoImageUrl(promo.imageUrl)}
            alt={promo.promoTitle}
            className="w-full aspect-4/3 object-cover bg-zinc-100"
          />
        )}

        <div className="p-4 md:p-5 space-y-3 text-xs">
          {promo.brand && (
            <span className="inline-block text-[10px] tracking-wide font-medium px-1.5 py-0.5 bg-black text-white">
              {promo.brand}
            </span>
          )}

          <p className="text-zinc-500">
            {formatMembershipDate(promo.promoStartDate)} –{" "}
            {formatMembershipDate(promo.promoEndDate)}
            {promo.promoLocation ? ` · ${promo.promoLocation}` : ""}
          </p>

          {promo.promoDetail && (
            <p className="text-zinc-600 whitespace-pre-line">
              {promo.promoDetail}
            </p>
          )}
        </div>
      </div>
    </MobileSheetModal>
  );
}

function PromoCard({
  promo,
  onSelect,
}: {
  promo: MembershipPromo;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="border border-zinc-200 text-left w-full flex gap-3 p-3 hover:border-black transition-colors cursor-pointer"
    >
      {promo.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={promoImageUrl(promo.imageUrl)}
          alt={promo.promoTitle}
          className="size-16 shrink-0 object-cover bg-zinc-100"
        />
      ) : (
        <div className="size-16 shrink-0 bg-zinc-100" />
      )}

      <div className="min-w-0 space-y-1">
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
        </p>
      </div>
    </button>
  );
}

export default function Promo() {
  const [promos, setPromos] = useState<MembershipPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<MembershipPromo | null>(
    null,
  );

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
            <Skeleton key={i} className="h-20 border border-zinc-200" />
          ))}
        </div>
      )}

      {!loading && error && <p className="text-sm text-red-500">⚠️ {error}</p>}

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
            <PromoCard
              key={promo.id}
              promo={promo}
              onSelect={() => setSelectedPromo(promo)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPromo && (
          <PromoDetailModal
            key={selectedPromo.id}
            promo={selectedPromo}
            onClose={() => setSelectedPromo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
