"use client";

import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { directionsUrl, embedUrl, type MapPlace } from "@/lib/maps";

/**
 * A store with a small map of where it is and a button that opens
 * directions in Google Maps.
 */
export default function StoreMapCard({
  store,
  code,
  showMap = true,
}: {
  store: MapPlace;
  code?: string | null;
  showMap?: boolean;
}) {
  return (
    <div className="border border-zinc-200">
      {showMap && (
        <div className="relative aspect-[16/9] w-full bg-zinc-100 sm:aspect-[2/1]">
          <iframe
            title={`Map of ${store.name}`}
            src={embedUrl(store)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.3]"
          />
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <MapPin size="1rem" className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="base-font text-sm font-semibold">
              {store.name}
              {code && (
                <span className="ml-1.5 font-normal text-zinc-400">{code}</span>
              )}
            </p>
            {store.address && (
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                {store.address}
              </p>
            )}
          </div>
        </div>

        <a
          href={directionsUrl(store)}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center justify-center gap-2 border border-black px-4 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-black hover:text-white"
        >
          <Navigation size="0.875rem" />
          Directions
          <ExternalLink size="0.75rem" className="opacity-60" />
        </a>
      </div>
    </div>
  );
}
