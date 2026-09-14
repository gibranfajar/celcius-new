"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, getBanners } from "@/lib/api";
import { Banner, Product } from "@/lib/api/types";
import Image from "next/image";
import ProductList from "@/components/ProductList";
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
import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";

export default function WomenHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [bannerTop, setBannerTop] = useState<Banner[]>([]);
  const [bannerBottom, setBannerBottom] = useState<Banner[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [productsRes, banners] = await Promise.all([
          getProducts(),
          getBanners({ page: "women" }),
        ]);

        setProducts(productsRes.data);
        setBannerTop(banners.filter((item) => item.position === "top"));
        setBannerBottom(banners.filter((item) => item.position === "bottom"));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

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
          <div className="relative w-full aspect-9/16 md:aspect-3/1">
            <Link
              href={`/collection/${item.collection?.slug ?? ""}`}
              className="block w-full h-full"
            >
              <Image
                src={item.image_url}
                fill
                priority
                alt={item.title}
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
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );

  const womenProducts = products
    .filter((item) => item.type === "women")
    .slice(0, 8);

  return (
    <>
      {isLoading ? (
        <SkeletonImage className="w-full aspect-9/16 md:aspect-3/1" />
      ) : (
        <>
          {bannerTop.length > 0 && (
            <div className="mb-1">{renderBannerByDevice(bannerTop)}</div>
          )}
          {bannerBottom.length > 0 && (
            <div className="mt-1">{renderBannerByDevice(bannerBottom)}</div>
          )}
        </>
      )}

      {/* product grid */}
      <div className="p-4 md:p-6">
        <h1 className="text-center font-medium mb-4 base-font text-lg">
          Celcius
        </h1>
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {womenProducts.length > 0 ? (
              womenProducts.map((item) => {
                const hasDiscount = item.final_price < item.price;
                const variantImages = item.variants?.[0]?.images ?? [];
                const hoverImage = variantImages[3]?.url ?? item.thumbnail_url;

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
                        <span className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1">
                          {item.discount_type === "percent"
                            ? `-${item.discount_value}%`
                            : "SALE"}
                        </span>
                      )}

                      {item.variants && item.variants.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-white/90 text-black text-[10px] font-semibold px-1.5 py-0.5">
                          +{item.variants.length}
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
