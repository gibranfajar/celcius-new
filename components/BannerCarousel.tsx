import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { Banner } from "@/lib/api/types";
import {
  BANNER_DISPLAY_TYPES,
  bannersForDisplay,
  getBannerDisplayClass,
} from "@/lib/bannerDisplayClass";

type BannerSizeClasses = {
  mobile: string;
  tablet: string;
  desktop: string;
};

// Mobile always gets a full-viewport-height hero regardless of the page;
// tablet/desktop each get their own aspect ratio so they don't collapse into
// the same size (both only differ from mobile at the `md:` breakpoint
// otherwise, per `getBannerDisplayClass`).
const DEFAULT_SIZE_CLASSES: BannerSizeClasses = {
  mobile: "min-h-screen",
  tablet: "aspect-4/3",
  desktop: "aspect-video",
};

export default function BannerCarousel({
  banners,
  sizeClasses,
  showLookbookLink = false,
}: {
  banners: Banner[];
  sizeClasses?: Partial<BannerSizeClasses>;
  showLookbookLink?: boolean;
}) {
  if (banners.length === 0) return null;

  const sizes = { ...DEFAULT_SIZE_CLASSES, ...sizeClasses };

  return (
    <>
      {BANNER_DISPLAY_TYPES.map((display) => {
        const items = bannersForDisplay(banners, display);
        if (items.length === 0) return null;

        const sizeClass = sizes[display ?? "desktop"];

        return (
          <div key={display} className={getBannerDisplayClass(display)}>
            <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop>
              {items.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className={`relative w-full ${sizeClass}`}>
                    <Link
                      href={`/collection/${item.collection?.slug ?? ""}`}
                      className="block w-full h-full"
                    >
                      <Image
                        src={item.image_url}
                        fill
                        priority
                        alt={item.title ?? ""}
                        className="object-cover cursor-pointer"
                      />
                    </Link>

                    <div className="absolute inset-0 flex flex-col justify-end items-center text-center text-white px-8 pb-12 md:items-end md:text-right md:px-12 md:pb-6 pointer-events-none">
                      <h1 className="text-3xl md:text-4xl">{item.title}</h1>

                      <div className="flex gap-2 mt-4 md:flex-row md:gap-2 md:mt-2 pointer-events-auto">
                        {item.collection && (
                          <Link
                            href={`/collection/${item.collection.slug}`}
                            className="relative text-sm"
                          >
                            Shop The Collection
                          </Link>
                        )}

                        {showLookbookLink && item.lookbook && (
                          <Link
                            href={`/lookbook/${item.lookbook.slug}`}
                            className="relative text-sm"
                          >
                            View The Lookbook
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        );
      })}
    </>
  );
}
