"use client";

import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RelatedProduct({ dataProduct }: any) {
  return (
    <div className="mt-6 base-font p-4 md:p-0">
      <h2 className="text-xl text-center mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {dataProduct && dataProduct.length > 0 ? (
          dataProduct.map((item: any, index: number) => {
            const hasDiscount = item.discount > 0;
            const finalPrice = hasDiscount
              ? item.price - (item.price * item.discount) / 100
              : item.price;

            return (
              <Link
                key={index}
                href={`/products/${item.type}/${item.slug}`}
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
                  <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition">
                    {formatProductName(item.name)}
                  </h1>

                  <div className="flex items-center gap-2 seccond-font font-semibold text-xs">
                    <span
                      className={`text-sm ${
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
  );
}
