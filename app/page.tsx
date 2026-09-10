"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import { formatMiniText } from "@/lib/formatMiniText";
import { getProducts, getBanners, getLookbooks } from "@/lib/api";
import { Banner, Lookbook, Product } from "@/lib/api/types";
import SkeletonImage from "@/components/SkeletonImage";
import {
  BANNER_DISPLAY_TYPES,
  bannersForDisplay,
  getBannerDisplayClass,
} from "@/lib/bannerDisplayClass";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [bannerTop, setBannerTop] = useState<Banner[]>([]);
  const [bannerBottom, setBannerBottom] = useState<Banner[]>([]);
  const [gridLookbooks, setGridLookbooks] = useState<Lookbook[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [productsRes, banners, lookbooksRes] = await Promise.all([
          getProducts(),
          getBanners({ page: "men" }),
          getLookbooks(),
        ]);

        setProducts(productsRes.data);
        setBannerTop(banners.filter((item) => item.position === "top"));
        setBannerBottom(banners.filter((item) => item.position === "bottom"));

        // Home grid: the 2 most recently published "men" lookbooks plus the
        // most recently published "women" one - 3 tiles total. `lookbooksRes`
        // is already ordered latest-first by the API.
        const latestMen = lookbooksRes.data
          .filter((l) => l.type === "men")
          .slice(0, 2);
        const latestWomen = lookbooksRes.data
          .filter((l) => l.type === "women")
          .slice(0, 1);
        setGridLookbooks([...latestMen, ...latestWomen]);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <SkeletonImage className="w-full aspect-4/5 md:aspect-video" />

        <div className="grid md:grid-cols-3 items-start p-6 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <SkeletonImage className="aspect-3/4" />
              <div className="h-4 w-2/3 bg-gray-200 mt-4 mb-2" />
              <div className="h-3 w-full bg-gray-100 mb-1" />
              <div className="h-3 w-4/5 bg-gray-100" />
            </div>
          ))}
        </div>

        <div className="p-4 md:p-6">
          <div className="h-4 w-24 bg-gray-200 mx-auto mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i}>
                <SkeletonImage className="aspect-2/3" />
                <div className="h-3 w-3/4 bg-gray-200 mt-3 mb-2" />
                <div className="h-3 w-1/3 bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderBannerByDevice = (banners: Banner[]) =>
    BANNER_DISPLAY_TYPES.map((display) => {
      const items = bannersForDisplay(banners, display);
      if (items.length === 0) return null;

      return (
        <div key={display} className={getBannerDisplayClass(display)}>
          {renderBannerSlider(items)}
        </div>
      );
    });

  const renderBannerSlider = (banners: Banner[]) => (
    <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop>
      {banners.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="relative w-full aspect-4/5 md:aspect-video">
            <Link href={`/collection/${item.collection?.slug ?? ""}`} className="block w-full h-full">
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

                {item.lookbook && (
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
  );

  return (
    <>
      {/* Banner Atas */}
      {bannerTop.length > 0 && (
        <div className="space-y-2">{renderBannerByDevice(bannerTop)}</div>
      )}

      {/* Grid Lookbook */}
      <div className="grid md:grid-cols-3 items-start p-6 gap-6 base-font">
        {gridLookbooks.map((item) => (
          <div key={item.slug}>
            <Link
              href={`/lookbook/${item.slug}`}
              className="cursor-pointer block relative aspect-3/4"
            >
              <Image
                src={item.thumbnail_url}
                alt={item.title ?? ""}
                fill
                className="object-cover"
              />
            </Link>
            <p className="text-lg mt-4 mb-2">{item.title}</p>
            {item.description && (
              <p
                className="text-xs text-gray-600 mb-2"
                dangerouslySetInnerHTML={formatMiniText(item.description, 100)}
              />
            )}
            <hr className="text-black mb-4 w-1/6" />
            <Link
              href={`/lookbook/${item.slug}`}
              aria-label={`View lookbook ${item.title}`}
              className="relative inline-block mt-6 text-verysmall"
            >
              VIEW THE LOOKBOOK
            </Link>
          </div>
        ))}
      </div>

      {/* Banner Bawah */}
      {bannerBottom.length > 0 && (
        <div className="space-y-2">{renderBannerByDevice(bannerBottom)}</div>
      )}

      {/* product grid */}
      <div className="p-4 md:p-6">
        <h1 className="text-center font-medium mb-2 base-font text-lg">
          Celcius
        </h1>
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.filter((item) => item.type === "men").length > 0 ? (
              products
                .filter((item) => item.type === "men")
                .slice(0, 8)
                .map((item) => {
                  const hasDiscount = item.final_price < item.price;
                  const variantImages = item.variants?.[0]?.images ?? [];
                  const hoverImage =
                    variantImages[1]?.url ?? item.thumbnail_url;

                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.type}/${item.slug}`}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={item.thumbnail_url}
                          loading="lazy"
                          alt={item.name ?? ""}
                          className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-0"
                          width={400}
                          height={600}
                        />
                        <Image
                          src={hoverImage}
                          loading="lazy"
                          alt={item.name ?? ""}
                          className="w-full h-auto object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          width={400}
                          height={600}
                        />

                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                            {item.discount_type === "percent"
                              ? `-${item.discount_value}%`
                              : "SALE"}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition base-font">
                          {formatProductName(item.name)}
                        </h1>

                        <div className="flex items-center gap-2 text-xs seccond-font">
                          <span
                            className={`font-semibold ${
                              hasDiscount ? "text-black" : "text-gray-900"
                            }`}
                          >
                            {formatToIdr(item.final_price)}
                          </span>

                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatToIdr(item.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                <p className="text-lg font-medium">Product not found.</p>
                <p className="text-sm">
                  Try changing the category or product type filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
