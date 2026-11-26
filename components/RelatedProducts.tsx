"use client";

import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Product } from "@/lib/api/types";
import SkeletonImage, { Skeleton } from "@/components/SkeletonImage";

/**
 * A row of related products you scroll sideways through (swipe on touch,
 * arrows on desktop), so it can hold many products without making the page
 * longer.
 */
export default function RelatedProduct({
  dataProduct,
  loading = false,
}: {
  dataProduct: Product[];
  loading?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollBack(rail.scrollLeft > 4);
    setCanScrollForward(
      rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateArrows();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [dataProduct, updateArrows]);

  const scrollByPage = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!loading && dataProduct.length === 0) {
    return null;
  }

  return (
    <section className="base-font mt-16 md:mt-24">
      <div className="mb-5 flex items-end justify-between gap-4 px-4 md:px-0">
        <div>
          <p className="seccond-font text-[0.6875rem] uppercase tracking-[0.2em] text-zinc-500">
            Complete the look
          </p>
          <h2 className="mt-1 text-xl md:text-2xl">You May Also Like</h2>
        </div>

        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollBack}
            aria-label="Previous products"
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-zinc-300 transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-300 disabled:hover:bg-transparent disabled:hover:text-current"
          >
            <ChevronLeft size="1.125rem" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollForward}
            aria-label="Next products"
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-zinc-300 transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-300 disabled:hover:bg-transparent disabled:hover:text-current"
          >
            <ChevronRight size="1.125rem" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={updateArrows}
        className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 md:scroll-px-0 md:gap-4 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-[44%] shrink-0 sm:w-[30%] md:w-[23%] lg:w-[19%]"
              >
                <SkeletonImage className="aspect-square" />
                <Skeleton className="mb-2 mt-3 h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          : dataProduct.map((item) => {
              const hasDiscount = item.final_price < item.price;
              const variantImages = item.variants?.[0]?.images ?? [];
              const hoverImage = variantImages[1]?.url ?? item.thumbnail_url;

              return (
                <Link
                  key={item.id}
                  href={`/products/${item.type}/${item.slug}`}
                  className="group w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[19%]"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                      className="object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
                    />
                    <Image
                      src={hoverImage}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                      className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                    />

                    {hasDiscount && (
                      <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[0.625rem] font-semibold tracking-wide text-white">
                        {item.discount_type === "percent"
                          ? `-${item.discount_value}%`
                          : "SALE"}
                      </span>
                    )}

                    {item.variants && item.variants.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-white/90 px-1.5 py-0.5 text-[0.625rem] font-semibold text-black">
                        {item.variants.length} colors
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <h3 className="line-clamp-2 text-sm font-medium text-zinc-800 transition-colors group-hover:text-black">
                      {formatProductName(item.name)}
                    </h3>
                    <div className="seccond-font flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
                      <span>{formatToIdr(item.final_price)}</span>
                      {hasDiscount && (
                        <span className="text-xs font-normal text-zinc-400 line-through">
                          {formatToIdr(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
