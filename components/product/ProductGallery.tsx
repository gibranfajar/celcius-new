"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type GalleryImage = { id: number; url: string };

/**
 * On desktop the first photo spans the full width and the rest sit two per
 * row; a last photo left without a partner spans the full width too.
 */
function isFullWidth(index: number, total: number): boolean {
  return index === 0 || (index === total - 1 && total % 2 === 0);
}

/**
 * Product photos.
 *
 * - Mobile: a full-width strip you swipe left/right (native scroll-snap, so
 *   it has the same momentum as an app), with a position indicator.
 * - Desktop: every photo laid out at once - the first one large, the rest
 *   two per row - so the shopper just scrolls down the page through them
 *   while the product details stay pinned beside it.
 */
export default function ProductGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const strip = stripRef.current;
    if (!strip || strip.clientWidth === 0) return;
    setActiveIndex(Math.round(strip.scrollLeft / strip.clientWidth));
  };

  const scrollTo = (index: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollTo({ left: index * strip.clientWidth, behavior: "smooth" });
  };

  if (images.length === 0) {
    return <div className="aspect-square w-full bg-zinc-100" />;
  }

  return (
    <>
      {/* Mobile: swipe left/right */}
      <div className="relative lg:hidden">
        <div
          ref={stripRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square w-full shrink-0 snap-center snap-always bg-zinc-100"
            >
              <Image
                src={image.url}
                alt={`${alt} - photo ${index + 1}`}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <span className="absolute right-3 top-3 bg-white/85 px-2 py-0.5 text-[0.6875rem] tabular-nums tracking-wide text-zinc-800 backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </span>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={`h-1 transition-all duration-300 ${
                    index === activeIndex ? "w-6 bg-black" : "w-2 bg-black/25"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop: scroll down through every photo */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`group relative aspect-square overflow-hidden bg-zinc-100 ${
              isFullWidth(index, images.length) ? "col-span-2" : ""
            }`}
          >
            <Image
              src={image.url}
              alt={`${alt} - photo ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority={index < 3}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </>
  );
}
