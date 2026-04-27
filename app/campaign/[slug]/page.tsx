"use client";

import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function CampaignPage({ params }: any) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { slug } = use<any>(params);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataCollection, setDataCollection] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${BASE_URL}campaign/detail/${slug}`);
        setDataCollection(response.data);
      } catch (err: any) {
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 space-y-4 seccond-font">
        {/* HEADER TITLE */}
        <div className="flex justify-between items-center sticky top-12 z-10 bg-white py-2">
          <h1 className="text-xl">{dataCollection?.title}</h1>
        </div>

        {/* BANNER & PRODUK GRID */}
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* Banner kiri (col-span-8) */}
          <div className="col-span-12 md:col-span-8">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${dataCollection?.banner_top}`}
              alt="Banner Top"
              className="w-full h-full object-cover"
              width={800}
              height={400}
            />
          </div>

          {/* Produk kanan (col-span-4, 2 grid vertikal) */}
          <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
            {dataCollection?.product_campaign
              ?.slice(0, 2)
              .map((item: any, i: number) => {
                const hasDiscount = item.product.discount > 0;
                const finalPrice = hasDiscount
                  ? item.product.price -
                    (item.product.price * item.product.discount) / 100
                  : item.product.price;

                return (
                  <Link
                    href={`/products/${item.product.type}/${item.product.slug}`}
                    key={i}
                    className="group flex flex-col"
                  >
                    <div className="relative overflow-hidden flex-1">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[0].path}`}
                        loading="lazy"
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                        width={400}
                        height={400}
                      />
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[3].path}`}
                        loading="lazy"
                        alt={item.product.name}
                        className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        width={400}
                        height={400}
                      />

                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                          -{item.product.discount}%
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition">
                        {formatProductName(item.product.name)}
                      </h1>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            hasDiscount ? "text-black" : "text-gray-900"
                          }`}
                        >
                          {formatToIdr(finalPrice)}
                        </span>

                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatToIdr(item.product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* KIRI: 4 produk (2x2 grid) */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-2 grid-rows-2 gap-4">
            {dataCollection?.product_campaign
              ?.slice(2, 6)
              .map((item: any, i: number) => {
                const hasDiscount = item.product.discount > 0;
                const finalPrice = hasDiscount
                  ? item.product.price -
                    (item.product.price * item.product.discount) / 100
                  : item.product.price;

                return (
                  <Link
                    href={`/products/${item.product.type}/${item.product.slug}`}
                    key={i}
                    className="group flex flex-col"
                  >
                    <div className="relative overflow-hidden flex-1">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[0].path}`}
                        loading="lazy"
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                        width={400}
                        height={400}
                      />
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[3].path}`}
                        loading="lazy"
                        alt={item.product.name}
                        className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        width={400}
                        height={400}
                      />

                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                          -{item.product.discount}%
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition">
                        {formatProductName(item.product.name)}
                      </h1>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            hasDiscount ? "text-black" : "text-gray-900"
                          }`}
                        >
                          {formatToIdr(finalPrice)}
                        </span>

                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatToIdr(item.product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>

          {/* KANAN: Banner menyesuaikan tinggi kiri */}
          <div className="col-span-12 min-h-screen md:col-span-4">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${dataCollection?.banner_center}`}
              alt="Banner Top"
              className="w-full h-full object-cover"
              width={400}
              height={600}
            />
          </div>
        </div>

        <div className="col-span-12 md:grid grid-cols-3 gap-4">
          {dataCollection?.product_campaign
            ?.slice(6, 9)
            .map((item: any, i: number) => {
              const hasDiscount = item.product.discount > 0;
              const finalPrice = hasDiscount
                ? item.product.price -
                  (item.product.price * item.product.discount) / 100
                : item.product.price;

              return (
                <Link
                  href={`/products/${item.product.type}/${item.product.slug}`}
                  key={i}
                  className="group flex flex-col mb-3"
                >
                  <div className="relative overflow-hidden flex-1">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[0].path}`}
                      loading="lazy"
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                      width={400}
                      height={400}
                    />
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[3].path}`}
                      loading="lazy"
                      alt={item.product.name}
                      className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      width={400}
                      height={400}
                    />

                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                        -{item.product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition">
                      {formatProductName(item.product.name)}
                    </h1>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          hasDiscount ? "text-black" : "text-gray-900"
                        }`}
                      >
                        {formatToIdr(finalPrice)}
                      </span>

                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatToIdr(item.product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

      {/* banner bawah */}
      <div className="col-span-12 my-4 h-screen md:h-auto">
        <Image
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${dataCollection?.banner_bottom}`}
          alt="Banner Bottom"
          className="w-full h-full object-cover md:object-contain"
          width={1200}
          height={400}
        />
      </div>

      {/* product grid */}
      <div className="col-span-12 px-4 md:grid grid-cols-3 gap-4">
        {dataCollection?.product_campaign
          ?.slice(9)
          .map((item: any, i: number) => {
            const hasDiscount = item.product.discount > 0;
            const finalPrice = hasDiscount
              ? item.product.price -
                (item.product.price * item.product.discount) / 100
              : item.product.price;

            return (
              <Link
                href={`/products/${item.product.type}/${item.product.slug}`}
                key={i}
                className="group flex flex-col mb-3"
              >
                <div className="relative overflow-hidden flex-1">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[0].path}`}
                    loading="lazy"
                    alt={item.product.name}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                    width={400}
                    height={400}
                  />
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.product.images[3].path}`}
                    loading="lazy"
                    alt={item.product.name}
                    className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    width={400}
                    height={400}
                  />

                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                      -{item.product.discount}%
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition">
                    {formatProductName(item.product.name)}
                  </h1>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        hasDiscount ? "text-black" : "text-gray-900"
                      }`}
                    >
                      {formatToIdr(finalPrice)}
                    </span>

                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatToIdr(item.product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
