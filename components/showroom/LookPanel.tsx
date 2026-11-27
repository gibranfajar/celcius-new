"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Ruler,
  X,
} from "lucide-react";
import SizeChartTable from "@/components/SizeChartTable";
import { motion, useDragControls, type PanInfo } from "framer-motion";
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

type Photo = { id: number; url: string };

/**
 * A product's photos, one at a time: swipe (touch or trackpad), drag with
 * the mouse, or use the arrows and dots. Native scroll-snap underneath, so
 * a swipe has the same momentum as an app.
 */
function PhotoSlider({ photos, alt }: { photos: Photo[]; alt: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const many = photos.length > 1;

  const onScroll = () => {
    const strip = stripRef.current;
    if (!strip || strip.clientWidth === 0) return;
    setActive(Math.round(strip.scrollLeft / strip.clientWidth));
  };

  const go = (index: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    const clamped = Math.min(Math.max(index, 0), photos.length - 1);
    strip.scrollTo({ left: clamped * strip.clientWidth, behavior: "smooth" });
  };

  // Mouse drag: follow the pointer with snapping off, then settle on the
  // photo the drag leaned toward. Touch and trackpads scroll natively.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const strip = stripRef.current;
    if (!strip || event.pointerType !== "mouse" || !many) return;
    drag.current = { x: event.clientX, left: strip.scrollLeft, moved: false };
    strip.setPointerCapture(event.pointerId);
    strip.style.scrollSnapType = "none";
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const strip = stripRef.current;
    const state = drag.current;
    if (!strip || !state) return;
    const dx = event.clientX - state.x;
    if (Math.abs(dx) > 4) state.moved = true;
    strip.scrollLeft = state.left - dx;
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const strip = stripRef.current;
    const state = drag.current;
    if (!strip || !state) return;
    drag.current = null;
    if (strip.hasPointerCapture(event.pointerId)) {
      strip.releasePointerCapture(event.pointerId);
    }
    const from = Math.round(state.left / strip.clientWidth);
    const dx = event.clientX - state.x;
    const leaned = Math.abs(dx) > strip.clientWidth * 0.15 ? -Math.sign(dx) : 0;
    const target = Math.min(Math.max(from + leaned, 0), photos.length - 1);
    strip.scrollTo({ left: target * strip.clientWidth, behavior: "smooth" });
    // Snap back on once the glide has landed, so it doesn't fight it.
    window.setTimeout(() => {
      strip.style.scrollSnapType = "";
    }, 450);
  };

  return (
    <div className="group/slider relative overflow-hidden bg-zinc-100">
      <div
        ref={stripRef}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        data-lenis-prevent
        className={`flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          many ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square w-full shrink-0 snap-center snap-always"
          >
            <Image
              src={photo.url}
              alt={`${alt} - photo ${index + 1}`}
              fill
              draggable={false}
              sizes="(min-width: 1024px) 27rem, (min-width: 640px) 25rem, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <span className="seccond-font pointer-events-none absolute right-3 top-3 bg-white/85 px-2 py-0.5 text-[0.6875rem] tabular-nums tracking-wide text-zinc-800">
            {active + 1} / {photos.length}
          </span>

          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/90 text-zinc-900 shadow-sm opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none disabled:!opacity-0 max-sm:hidden"
          >
            <ChevronLeft size="1rem" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === photos.length - 1}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/90 text-zinc-900 shadow-sm opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none disabled:!opacity-0 max-sm:hidden"
          >
            <ChevronRight size="1rem" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                onClick={() => go(index)}
                className={`h-1 cursor-pointer transition-all duration-300 ${
                  index === active ? "w-6 bg-black" : "w-2 bg-black/25 hover:bg-black/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** One product of the look: photos, price, color, sizes and size chart. */
function LookItemCard({ item }: { item: LookItem }) {
  const { product, variant } = item;
  const photos: Photo[] =
    variant.images.length > 0
      ? variant.images
      : [{ id: 0, url: variant.thumbnail_url }];
  const hasDiscount = product.final_price < product.price;
  const category = product.categories?.[0]?.name;
  const name = formatProductName(product.name);

  return (
    <article className="py-6">
      <PhotoSlider photos={photos} alt={name} />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {category && (
            <p className="seccond-font text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">
              {category}
            </p>
          )}
          <Link
            href={productHref(item)}
            className="base-font mt-0.5 line-clamp-2 text-base leading-snug hover:underline hover:underline-offset-4"
          >
            {name}
          </Link>
          <p className="seccond-font mt-1.5 flex items-center gap-1.5 text-xs text-zinc-600">
            <span
              className="h-3 w-3 rounded-full border border-black/15 bg-zinc-200"
              style={variant.color.code ? { backgroundColor: variant.color.code } : undefined}
            />
            {formatProductName(variant.color.name)}
          </p>
        </div>

        <div className="seccond-font shrink-0 text-right">
          <p className="text-sm font-semibold">{formatToIdr(product.final_price)}</p>
          {hasDiscount && (
            <p className="text-xs text-zinc-400 line-through">
              {formatToIdr(product.price)}
            </p>
          )}
        </div>
      </div>

      {variant.sizes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Sizes">
          {sortProductSizes(variant.sizes).map((size) => (
            <li
              key={size.id}
              className="seccond-font min-w-9 border border-zinc-300 px-2 py-1 text-center text-[0.6875rem]"
            >
              {size.size}
            </li>
          ))}
        </ul>
      )}

      {product.sizechart && (
        <section className="mt-4" aria-label="Size chart">
          <p className="seccond-font mb-2 flex items-center gap-1.5 text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">
            <Ruler size="0.75rem" />
            Size chart
          </p>
          <SizeChartTable
            html={product.sizechart}
            className="border border-zinc-100"
          />
        </section>
      )}

      <Link
        href={productHref(item)}
        className="seccond-font mt-4 flex h-11 w-full items-center justify-center gap-2 border border-black text-xs uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
      >
        Shop now
        <ArrowRight size="0.75rem" />
      </Link>
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
  const panelRef = useRef<HTMLElement>(null);
  const backdropPressedRef = useRef(false);
  useBodyScrollLock();

  // On a phone the panel is a bottom sheet that moves like the other sheets
  // (MobileSheetModal, e.g. Add to cart): it springs up from the bottom, has
  // no X, and closes by dragging its handle (or header) down or tapping the
  // page above it. Every way of closing slides it back down, since the
  // Showroom renders it inside AnimatePresence. On wider screens it slides
  // in from the right.
  const [isPhone] = useState(() =>
    window.matchMedia("(max-width: 639px)").matches,
  );
  const dragControls = useDragControls();
  const startDrag = (event: React.PointerEvent) => {
    if (isPhone) dragControls.start(event);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 600) onClose();
  };
  const hidden = isPhone ? { y: "100%" } : { x: "2.5rem", opacity: 0 };
  const shown = isPhone ? { y: 0 } : { x: 0, opacity: 1 };

  useEffect(() => {
    // The X is hidden on a phone: focus the panel itself there.
    const close = closeRef.current;
    (close?.offsetParent ? close : panelRef.current)?.focus();
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
      <motion.button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onPointerDown={() => {
          backdropPressedRef.current = true;
        }}
        onClick={() => {
          // Only a press that began here. The tap that opened the panel (on
          // the 3D scene) is followed by the browser's own click at the same
          // spot, landing on this backdrop once it has appeared; without
          // this check that click would close the panel straight away.
          if (backdropPressedRef.current) onClose();
          backdropPressedRef.current = false;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] cursor-default touch-none bg-black/10 max-sm:bg-black/50"
      />

      <motion.aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="look-panel-title"
        tabIndex={-1}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        initial={hidden}
        animate={shown}
        exit={hidden}
        transition={
          isPhone
            ? { type: "spring", damping: 32, stiffness: 320 }
            : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
        }
        className="outline-none! fixed z-[61] flex select-text flex-col bg-white shadow-[0_0_60px_rgba(15,15,25,0.18)] max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[85dvh] max-sm:rounded-t-2xl sm:inset-y-0 sm:right-0 sm:w-[28rem] lg:w-[30rem]"
      >
        {/* drag handle (phone) */}
        <div
          aria-hidden
          onPointerDown={startDrag}
          className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing sm:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>

        <div
          onPointerDown={startDrag}
          className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 pb-4 pt-5 max-sm:touch-none max-sm:pt-2"
        >
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
            className="grid h-9 w-9 shrink-0 max-sm:hidden cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black"
          >
            <X size="1rem" />
          </button>
        </div>

        <div
          data-lenis-prevent
          className="flex-1 divide-y divide-zinc-100 overflow-y-auto overscroll-contain px-6"
        >
          {look.items.length === 0 ? (
            <p className="seccond-font py-10 text-center text-sm text-zinc-500">
              The pieces of this look are not available right now.
            </p>
          ) : (
            look.items.map((item) => <LookItemCard key={item.variant.id} item={item} />)
          )}
        </div>

        {/* The look's own collection when it has one (and it is switched
            on); otherwise every collection, so the way on is always there. */}
        <div className="border-t border-zinc-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            href={
              look.collection?.slug
                ? `/collection/${look.collection.slug}`
                : "/collection"
            }
            onClick={onClose}
            className="seccond-font flex h-12 w-full items-center justify-center gap-2 bg-black px-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800"
          >
            <LayoutGrid size="0.875rem" />
            {look.collection?.slug ? "Show the collection" : "Show the collections"}
            <ArrowRight size="0.875rem" />
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
