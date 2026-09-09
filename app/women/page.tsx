"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, getBanners } from "@/lib/api";
import { Banner, Product } from "@/lib/api/types";
import Image from "next/image";
import ProductList from "@/components/ProductList";
import SkeletonImage from "@/components/SkeletonImage";
import { getDeviceType } from "@/lib/getDeviceType";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

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
          getBanners({ page: "women", display: getDeviceType() }),
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

  const renderBannerSlider = (banners: Banner[]) => (
    <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop>
      {banners.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="relative w-full aspect-4/5 md:aspect-5/1">
            <Link href={`/collection/${item.collection?.slug ?? ""}`} className="block w-full h-full">
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

  const womenProducts = products.filter((item) => item.type === "women").slice(0, 8);

  return (
    <>
      {isLoading ? (
        <SkeletonImage className="w-full aspect-4/5 md:aspect-5/1 animate-pulse" />
      ) : (
        <>
          {bannerTop.length > 0 && <div className="mb-1">{renderBannerSlider(bannerTop)}</div>}
          {bannerBottom.length > 0 && (
            <div className="mt-1">{renderBannerSlider(bannerBottom)}</div>
          )}
        </>
      )}

      {/* product grid */}
      <div className="p-4 md:p-6">
        <h1 className="text-center font-medium mb-4 base-font text-lg">Celcius</h1>
        <ProductList data={womenProducts} loading={isLoading} />
      </div>
    </>
  );
}
