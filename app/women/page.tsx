"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);
  const [dataProduct, setDataProduct] = useState<any[]>([]);
  const [bannerDataTop, setBannerDataTop] = useState<any[]>([]);
  const [bannerDataBottom, setBannerDataBottom] = useState<any[]>([]);

  useEffect(() => {
    const fetchDataProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await axios.get(`${BASE_URL}product-list`);
        setDataProduct(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    const fetchDataBanner = async () => {
      setIsLoadingBanner(true);
      try {
        const response = await axios.get(`${BASE_URL}home-displays?type=women`);

        const filteredDataTop = response.data.filter(
          (item: any) => item.position === "top",
        );

        const filteredDataBottom = response.data.filter(
          (item: any) => item.position === "bottom",
        );

        setBannerDataTop(filteredDataTop);
        setBannerDataBottom(filteredDataBottom);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingBanner(false);
      }
    };

    fetchDataBanner();
    fetchDataProduct();
  }, []);

  if (isLoadingProduct || isLoadingBanner) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  return (
    <>
      {/* Banner Atas */}
      <div className="mb-1">
        <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop>
          {bannerDataTop.map((item: any, index: number) => (
            <SwiperSlide key={index}>
              <div className="relative">
                <Link href={`campaign/${item.campaign?.slug}`}>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.banner}`}
                    loading="lazy"
                    alt={item.title}
                    className="block w-full object-cover h-screen md:h-auto cursor-pointer"
                    width={1920}
                    height={400}
                  />
                </Link>

                <div className="absolute inset-0 flex flex-col justify-end items-center text-center text-white px-8 pb-12 md:items-end md:text-right md:px-12 md:pb-6 pointer-events-none">
                  <h1 className="text-3xl md:text-4xl">{item.title}</h1>

                  <div className="flex gap-2 mt-4 md:flex-row md:gap-2 md:mt-2 pointer-events-auto">
                    <Link
                      href={`campaign/${item.campaign?.slug}`}
                      className="relative text-sm"
                    >
                      Shop The Collection
                    </Link>

                    <Link
                      href={`collection/${item.collection?.slug}`}
                      className="relative text-sm"
                    >
                      View The Lookbook
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Banner Bawah */}
      <div className="mt-1">
        <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop>
          {bannerDataBottom.map((item: any, index: number) => (
            <SwiperSlide key={index}>
              <div className="relative">
                <Link href={`campaign/${item.campaign?.slug}`}>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.banner}`}
                    loading="lazy"
                    alt={item.title}
                    className="block w-full object-cover h-screen md:h-auto cursor-pointer"
                    width={1920}
                    height={400}
                  />
                </Link>

                <div className="absolute inset-0 flex flex-col justify-end items-center text-center text-white px-8 pb-12 md:items-end md:text-right md:px-12 md:pb-6 pointer-events-none">
                  <h1 className="text-3xl md:text-4xl">{item.title}</h1>

                  <div className="flex gap-2 mt-4 md:flex-row md:gap-2 md:mt-2 pointer-events-auto">
                    <Link
                      href={`campaign/${item.campaign?.slug}`}
                      className="relative text-sm"
                    >
                      Shop The Collection
                    </Link>

                    <Link
                      href={`collection/${item.collection?.slug}`}
                      className="relative text-sm"
                    >
                      View The Lookbook
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* product grid */}
      <div className="p-4 md:p-6">
        <h1 className="text-center font-medium mb-2 base-font text-lg">
          Celcius
        </h1>
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dataProduct && dataProduct.length > 0 ? (
              dataProduct
                .filter((item: any) => item.type === "women")
                .slice(0, 8)
                .map((item: any, index: number) => {
                  const hasDiscount = item.discount > 0;
                  const finalPrice = hasDiscount
                    ? item.price - (item.price * item.discount) / 100
                    : item.price;

                  return (
                    <Link
                      key={index}
                      href={`/products/${item.slug}/${item.article}`}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={item.image1}
                          loading="lazy"
                          alt={item.name}
                          className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-0"
                          width={500}
                          height={500}
                        />
                        <Image
                          src={item.image2}
                          loading="lazy"
                          alt={item.name}
                          className="w-full h-auto object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          width={500}
                          height={500}
                        />

                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                            -{item.discount}%
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
                            {formatToIdr(finalPrice)}
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
