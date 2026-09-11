"use client";

import { Award } from "lucide-react";
import { MembershipTierBenefit } from "@/lib/api/types";
import { formatToIdr } from "@/lib/formatToIdr";
import { tierImageUrl } from "@/lib/membershipAssetUrl";
import { Skeleton } from "@/components/SkeletonImage";

function TierCard({ tier }: { tier: MembershipTierBenefit }) {
  const isActive = tier.status.toLowerCase() === "active";

  return (
    <div
      className={`border p-4 flex gap-4 ${
        isActive ? "border-black" : "border-zinc-200"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tierImageUrl(tier.tier_image)}
        alt={tier.tier}
        className="size-14 shrink-0 object-contain"
      />

      <div className="min-w-0 space-y-1.5 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-medium text-sm flex items-center gap-1.5">
            {tier.tier}
            {isActive && (
              <span className="text-[10px] tracking-wide font-medium px-1.5 py-0.5 bg-black text-white">
                CURRENT
              </span>
            )}
          </p>
          {!isActive && (
            <span className="text-[10px] text-zinc-400">Locked</span>
          )}
        </div>

        <p className="text-xs text-zinc-500">
          {formatToIdr(tier.amountStartingFrom)} –{" "}
          {formatToIdr(tier.amountUpTo)}
        </p>

        <ul className="text-xs text-zinc-600 list-disc list-inside space-y-0.5">
          {Object.values(tier.benefitData).map((benefit, i) => (
            <li key={i}>{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MembershipTier({
  tierData,
  loading,
}: {
  tierData: MembershipTierBenefit[];
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Membership Tiers</h1>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 border border-zinc-200" />
          ))}
        </div>
      )}

      {!loading && tierData.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
          <Award size={28} className="text-gray-300" />
          <p className="text-sm">
            You&apos;re not enrolled in the membership program yet.
          </p>
        </div>
      )}

      {!loading && tierData.length > 0 && (
        <div className="space-y-3">
          {tierData.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      )}
    </div>
  );
}
