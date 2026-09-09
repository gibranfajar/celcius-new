"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { getLocations } from "@/lib/api";
import { Location, ProductType } from "@/lib/api/types";
import SkeletonImage from "@/components/SkeletonImage";

function formatTime(time: string | null) {
  if (!time) return "-";
  return time.slice(0, 5);
}

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function StoreCard({ item }: { item: Location }) {
  return (
    <div className="border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
      <h2 className="font-semibold text-base">{item.store_name}</h2>

      <div className="flex items-start gap-2 mt-3 text-sm text-zinc-600">
        <MapPin size={15} className="mt-0.5 shrink-0 text-zinc-400" />
        <p>{item.address}</p>
      </div>

      {item.phone_number && (
        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-600">
          <Phone size={15} className="shrink-0 text-zinc-400" />
          <a href={`tel:${item.phone_number}`} className="nav-link w-fit">
            {item.phone_number}
          </a>
        </div>
      )}

      {item.maps_url && (
        <a
          href={item.maps_url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-xs font-medium tracking-wide underline underline-offset-2 hover:text-zinc-500"
        >
          GET DIRECTIONS
        </a>
      )}

      {item.operational_hours.length > 0 && (
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide mb-2 text-zinc-500">
            <Clock size={13} />
            OPENING HOURS
          </div>
          <ul className="text-xs space-y-1.5 text-zinc-600">
            {item.operational_hours.map((hour) => (
              <li key={hour.day_of_week} className="flex justify-between">
                <span>{DAY_LABELS[hour.day_of_week] ?? hour.day_of_week}</span>
                <span className={hour.is_closed ? "text-zinc-400" : ""}>
                  {hour.is_closed
                    ? "Closed"
                    : `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function LocationPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [gender, setGender] = useState<ProductType>("men");
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const data = await getLocations({ type: gender });
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [gender]);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative w-full aspect-16/7 md:aspect-21/6">
        <Image
          src={gender === "men" ? "/images/locationmen.jpg" : "/images/location-women.jpg"}
          alt={`${gender} store locations`}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-white text-2xl md:text-4xl tracking-wide base-font">
            STORE LOCATOR
          </h1>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-center py-6 px-4">
        <div className="inline-flex border border-zinc-300">
          {(["men", "women"] as ProductType[]).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-6 py-2 text-xs tracking-wide cursor-pointer transition-colors ${
                gender === g
                  ? "bg-black text-white"
                  : "bg-white text-zinc-600 hover:text-black"
              }`}
            >
              {g === "men" ? "MEN" : "WOMEN"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 pb-16 max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonImage key={i} className="h-56" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            No locations found for {gender === "men" ? "Men" : "Women"}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((item) => (
              <StoreCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
