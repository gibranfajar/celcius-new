"use client";

import { useEffect, useState } from "react";
import { Award, Ticket } from "lucide-react";
import { getMembershipProfile } from "@/lib/api";
import { MembershipMission, MembershipProfile } from "@/lib/api/types";
import { formatToIdr } from "@/lib/formatToIdr";
import { Skeleton } from "@/components/SkeletonImage";

function MissionCard({ mission }: { mission: MembershipMission }) {
  const progress =
    mission.maxValue > 0
      ? Math.min(100, (mission.currentValue / mission.maxValue) * 100)
      : 0;

  return (
    <div className="border border-zinc-200 p-3 text-xs space-y-1.5 min-w-52 shrink-0">
      <p className="font-medium">{mission.title}</p>
      <p className="text-zinc-500">{mission.description}</p>
      <div className="h-1.5 bg-zinc-100 overflow-hidden">
        <div
          className="h-full bg-black"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-zinc-400">{mission.progressText}</p>
    </div>
  );
}

export default function MembershipSummary() {
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [profile, setProfile] = useState<MembershipProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMembershipProfile()
      .then((res) => {
        if (cancelled) return;
        setIsMember(res.is_member);
        setProfile(res.data);
      })
      .catch((error) => console.error("Error fetching membership profile:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Skeleton className="h-28" />;
  }

  // Membership is a separate, offline-store loyalty program - not every
  // customer of the web store is enrolled in it, so this quietly does
  // nothing rather than nagging non-members.
  if (!isMember || !profile) return null;

  return (
    <div className="border border-zinc-200 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {profile.tierInfo.tierImage && (
            // Third-party CDN with an unpredictable host - not worth adding
            // to next.config's image domain allowlist for one small badge.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.tierInfo.tierImage}
              alt={profile.tierInfo.tier_name}
              className="size-10 shrink-0 object-contain"
            />
          )}
          <div>
            <p className="font-medium text-sm flex items-center gap-1.5">
              <Award size={14} /> {profile.tierInfo.tier_name}
            </p>
            <p className="text-xs text-zinc-500">{profile.fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Ticket size={14} />
          {profile.totalVoucher} voucher{profile.totalVoucher === 1 ? "" : "s"}
        </div>
      </div>

      {profile.tierInfo.amountForNextTier > 0 && (
        <p className="text-xs text-zinc-500">
          {formatToIdr(profile.tierInfo.amountForNextTier)} more to reach the
          next tier.
        </p>
      )}

      {profile.missionsData.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Missions</p>
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4">
            {profile.missionsData.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
