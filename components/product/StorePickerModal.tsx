"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Store, X } from "lucide-react";
import MobileSheetModal from "@/components/MobileSheetModal";
import { Skeleton } from "@/components/SkeletonImage";
import { getErrorMessage, getStoreStock } from "@/lib/api";
import type { StoreStock, StoreStockResult } from "@/lib/api/types";

type Coordinates = { latitude: number; longitude: number };

type Phase = "locating" | "loading" | "ready" | "error";

/** Where the shopper's location is kept for the rest of the visit, so the
 *  browser isn't asked again for every product. */
const LOCATION_KEY = "shopper-location";

/** Few enough left to tell the shopper. */
const LOW_STOCK = 3;

function readSavedLocation(): Coordinates | null {
  try {
    const saved = sessionStorage.getItem(LOCATION_KEY);
    return saved ? (JSON.parse(saved) as Coordinates) : null;
  } catch {
    return null;
  }
}

/** "JAWA BARAT" -> "Jawa Barat", keeping short acronyms: "DKI", "DI Yogyakarta". */
export function formatProvince(province: string): string {
  return province
    .split(/\s+/)
    .map((word) =>
      word.length <= 3
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toLocaleString("id-ID")} km`;
}

/**
 * Asks where the shopper wants to buy a size from before it goes into the
 * cart: with their permission it uses their location to recommend the
 * nearest stores that have the size, otherwise they pick a province.
 */
export default function StorePickerModal({
  productSizeId,
  description,
  currentStoreCode,
  confirmLabel = "Add to cart",
  onClose,
  onConfirm,
}: {
  productSizeId: number;
  /** What is being bought, e.g. "Linen Shirt · Black · Size M". */
  description: string;
  /** The store already picked, selected again when it's in the list. */
  currentStoreCode?: string | null;
  /** The confirm button's action, followed by the store's name. */
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (store: StoreStock) => void;
}) {
  const [phase, setPhase] = useState<Phase>("locating");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [result, setResult] = useState<StoreStockResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadStores = useCallback(
    async (coords: Coordinates | null, province?: string) => {
      const id = ++requestId.current;
      setPhase("loading");
      setError(null);

      try {
        const data = await getStoreStock(productSizeId, {
          ...(coords ?? {}),
          province: province || undefined,
        });
        if (id !== requestId.current) return;
        setResult(data);
        // The store already picked stays selected; otherwise the nearest
        // one is the recommendation.
        const current = data.stores.find(
          (store) => store.store_code === currentStoreCode,
        );
        setSelectedCode(current?.store_code ?? data.stores[0]?.store_code ?? null);
        setPhase("ready");
      } catch (loadError) {
        if (id !== requestId.current) return;
        setError(getErrorMessage(loadError));
        setPhase("error");
      }
    },
    [productSizeId, currentStoreCode],
  );

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNote("Your browser can't share its location.");
      loadStores(null);
      return;
    }

    setPhase("locating");
    setLocationNote(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        };
        sessionStorage.setItem(LOCATION_KEY, JSON.stringify(coords));
        setCoordinates(coords);
        loadStores(coords);
      },
      (positionError) => {
        setLocationNote(
          positionError.code === positionError.PERMISSION_DENIED
            ? "Location access is off. Allow it to see the nearest store, or pick a province below."
            : "We couldn't find your location. Pick a province below, or try again.",
        );
        loadStores(null);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }, [loadStores]);

  useEffect(() => {
    const saved = readSavedLocation();
    if (saved) {
      setCoordinates(saved);
      loadStores(saved);
    } else {
      locate();
    }
  }, [loadStores, locate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const stores = result?.stores ?? [];
  const provinces = result?.provinces ?? [];
  const selectedStore = stores.find((store) => store.store_code === selectedCode);
  const isBusy = phase === "locating" || phase === "loading";

  return (
    <MobileSheetModal
      onClose={onClose}
      className="seccond-font flex max-h-[90vh] flex-col sm:max-w-lg sm:rounded-none"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-picker-title"
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 pb-4 pt-3 sm:pt-5">
          <div className="min-w-0">
            <h2 id="store-picker-title" className="base-font text-lg">
              Choose a store
            </h2>
            <p className="mt-1 truncate text-xs text-zinc-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="max-sm:hidden cursor-pointer text-zinc-500 hover:text-black"
          >
            <X size="1.25rem" />
          </button>
        </div>

        {/* Location / province */}
        <div className="space-y-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4">
          {phase === "locating" ? (
            <p className="flex items-center gap-2 text-xs text-zinc-600">
              <LocateFixed size="0.875rem" className="animate-pulse" />
              Finding your location…
            </p>
          ) : result?.detected && result.province ? (
            <p className="flex items-center gap-2 text-xs text-zinc-600">
              <MapPin size="0.875rem" className="shrink-0" />
              Nearest stores with your size, in{" "}
              <span className="font-semibold text-black">
                {formatProvince(result.province)}
              </span>
            </p>
          ) : (
            locationNote && (
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs leading-relaxed text-zinc-600">
                  {locationNote}
                </p>
                <button
                  type="button"
                  onClick={locate}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold underline underline-offset-4 hover:text-zinc-600"
                >
                  <LocateFixed size="0.875rem" />
                  Use my location
                </button>
              </div>
            )
          )}

          {provinces.length > 0 && (
            <label className="block">
              <span className="sr-only">Province</span>
              <select
                value={result?.province ?? ""}
                onChange={(event) => loadStores(coordinates, event.target.value)}
                disabled={isBusy}
                className="w-full cursor-pointer border border-zinc-300 bg-white px-3 py-2.5 text-sm hover:border-black disabled:cursor-wait disabled:opacity-60"
              >
                {!result?.province && <option value="">Choose a province</option>}
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {formatProvince(province)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* Stores */}
        <div className="min-h-48 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {isBusy ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : phase === "error" ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-zinc-600">{error}</p>
              <button
                type="button"
                onClick={() => loadStores(coordinates, result?.province ?? undefined)}
                className="cursor-pointer border border-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : provinces.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-600">
              This size is out of stock in every store right now.
            </p>
          ) : stores.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-600">
              Choose a province to see the stores that have this size.
            </p>
          ) : (
            <ul className="space-y-2" role="radiogroup" aria-label="Stores">
              {stores.map((store, index) => {
                const isSelected = store.store_code === selectedCode;
                const isNearest = index === 0 && store.distance_km !== null;

                return (
                  <li key={store.store_code}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedCode(store.store_code)}
                      className={`flex w-full cursor-pointer items-start gap-3 border p-3.5 text-left transition ${
                        isSelected
                          ? "border-black bg-zinc-50"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected ? "border-black" : "border-zinc-300"
                        }`}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-black" />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="base-font text-sm font-semibold">
                            {store.name}
                          </span>
                          {isNearest && (
                            <span className="bg-black px-1.5 py-0.5 text-[0.625rem] uppercase tracking-wider text-white">
                              Nearest
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {store.address ?? store.city} · {store.store_code}
                        </span>
                        <span
                          className={`mt-1.5 block text-xs ${
                            store.qty <= LOW_STOCK ? "text-red-600" : "text-emerald-700"
                          }`}
                        >
                          {store.qty <= LOW_STOCK
                            ? `Only ${store.qty} left`
                            : `In stock (${store.qty})`}
                        </span>
                      </span>

                      {store.distance_km !== null && (
                        <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                          {formatDistance(store.distance_km)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            disabled={!selectedStore || isBusy}
            onClick={() => selectedStore && onConfirm(selectedStore)}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-black px-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            <Store size="0.875rem" />
            {selectedStore ? `${confirmLabel} · ${selectedStore.name}` : confirmLabel}
          </button>
        </div>
      </div>
    </MobileSheetModal>
  );
}
