"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, LayoutGrid, X } from "lucide-react";
import type { Look, LookItem } from "@/lib/api/types";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import { sortProductSizes } from "@/lib/sortProductSizes";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

/** A look's title: the name of its collection. */
export function lookTitle(look: Look): string {
  return look.collection?.name ?? "The look";
}

function productHref(item: LookItem): string {
  return `/products/${item.product.type}/${item.product.slug}?variant=${item.variant.id}`;
}

/** One product of the look: its photos, price, color and sizes. */
function LookItemCard({ item }: { item: LookItem }) {
  const { product, variant } = item;
  const photos =
    variant.images.length > 0
      ? variant.images.slice(0, 4)
      : [{ id: 0, url: variant.thumbnail_url }];
  const [active, setActive] = useState(0);
  const hasDiscount = product.final_price < product.price;
  const category = product.categories?.[0]?.name;

  return (
    <article className="flex gap-4 py-5">
      <div className="w-28 shrink-0 sm:w-32">
        <Link
          href={productHref(item)}
          className="relative block aspect-square overflow-hidden bg-zinc-100"
        >
          <Image
            key={photos[active].url}
            src={photos[active].url}
            alt={formatProductName(product.name)}
            fill
            sizes="8rem"
            className="object-cover"
          />
        </Link>
        {photos.length > 1 && (
          <div className="mt-1.5 grid grid-cols-4 gap-1">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === active}
                className={`relative aspect-square cursor-pointer overflow-hidden bg-zinc-100 ring-1 transition ${
                  index === active ? "ring-black" : "ring-transparent hover:ring-zinc-300"
                }`}
              >
                <Image src={photo.url} alt="" fill sizes="2rem" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {category && (
          <p className="seccond-font text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">
            {category}
          </p>
        )}
        <Link
          href={productHref(item)}
          className="base-font mt-0.5 line-clamp-2 text-sm leading-snug hover:underline hover:underline-offset-4"
        >
          {formatProductName(product.name)}
        </Link>

        <div className="seccond-font mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold">{formatToIdr(product.final_price)}</span>
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through">
              {formatToIdr(product.price)}
            </span>
          )}
        </div>

        <p className="seccond-font mt-2 flex items-center gap-1.5 text-xs text-zinc-600">
          <span
            className="h-3 w-3 rounded-full border border-black/15 bg-zinc-200"
            style={variant.color.code ? { backgroundColor: variant.color.code } : undefined}
          />
          {formatProductName(variant.color.name)}
        </p>

        {variant.sizes.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1" aria-label="Sizes">
            {sortProductSizes(variant.sizes).map((size) => (
              <li
                key={size.id}
                className="seccond-font min-w-8 border border-zinc-300 px-1.5 py-0.5 text-center text-[0.6875rem]"
              >
                {size.size}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={productHref(item)}
          className="seccond-font mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] underline underline-offset-4 hover:text-zinc-600"
        >
          Shop now
          <ArrowRight size="0.75rem" />
        </Link>
      </div>
    </article>
  );
}

/**
 * What a look is wearing: opens beside the showroom on desktop and as a
 * sheet from the bottom on a phone.
 */
export default function LookPanel({
  look,
  onClose,
}: {
  look: Look;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock();

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const total = look.items.reduce((sum, item) => sum + item.product.final_price, 0);

  return (
    <>
      {/* click anywhere outside the panel to close */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-[60] cursor-default touch-none bg-black/10"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="look-panel-title"
        className="look-panel fixed z-[61] flex select-text flex-col bg-white shadow-[0_0_60px_rgba(15,15,25,0.18)] max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[85dvh] max-sm:rounded-t-2xl sm:inset-y-0 sm:right-0 sm:w-[28rem] lg:w-[30rem]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 pb-4 pt-5">
          <div className="min-w-0">
            <p className="seccond-font text-[0.6875rem] uppercase tracking-[0.28em] text-zinc-400">
              Shop the look
            </p>
            <h2 id="look-panel-title" className="base-font mt-1 text-xl leading-snug">
              {lookTitle(look)}
            </h2>
            {look.items.length > 0 && (
              <p className="seccond-font mt-1 text-xs text-zinc-500">
                {look.items.length} {look.items.length === 1 ? "piece" : "pieces"} ·{" "}
                {formatToIdr(total)}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black"
          >
            <X size="1rem" />
          </button>
        </div>

        <div className="flex-1 divide-y divide-zinc-100 overflow-y-auto overscroll-contain px-6">
          {look.items.length === 0 ? (
            <p className="seccond-font py-10 text-center text-sm text-zinc-500">
              The pieces of this look are not available right now.
            </p>
          ) : (
            look.items.map((item) => <LookItemCard key={item.variant.id} item={item} />)
          )}
        </div>

        {look.collection?.slug && (
          <div className="border-t border-zinc-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href={`/collection/${look.collection.slug}`}
              onClick={onClose}
              className="seccond-font flex h-12 w-full items-center justify-center gap-2 bg-black px-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800"
            >
              <LayoutGrid size="0.875rem" />
              Show the collection
              <ArrowRight size="0.875rem" />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
