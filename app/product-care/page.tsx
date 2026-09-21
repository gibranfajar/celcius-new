"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getProductCares } from "@/lib/api";
import { ProductCare } from "@/lib/api/types";

const SLIDE_INTERVAL_MS = 2000;
const IMAGE_SIZES = "(min-width: 768px) 50vw, 100vw";

function ProductCareSkeleton() {
  return (
    <div
      className="animate-pulse md:flex md:justify-center"
      role="status"
      aria-label="Loading product care guide"
    >
      <div className="mb-12 md:mb-0 md:w-1/2 md:pr-12">
        <div className="mb-6 aspect-square bg-zinc-200" />
        <div className="max-w-125 space-y-2">
          <div className="h-3 w-full bg-zinc-200" />
          <div className="h-3 w-11/12 bg-zinc-200" />
          <div className="h-3 w-2/3 bg-zinc-200" />
        </div>
        <hr className="my-12 border-zinc-200" />
      </div>

      <div className="md:w-5/12">
        <ul className="border-b border-zinc-200">
          {Array.from({ length: 7 }, (_, i) => (
            <li key={i} className="border-t border-zinc-200 py-6">
              <div className="h-3 w-24 bg-zinc-200" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ProductCarePage() {
  const [productCares, setProductCares] = useState<ProductCare[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeId, setActiveId] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProductCares = async () => {
      setLoading(true);
      try {
        setProductCares(await getProductCares());
      } catch (error) {
        console.error("Error fetching product cares:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCares();
  }, []);

  // Autoplay fade through every material until the visitor picks one.
  useEffect(() => {
    if (activeId !== null || productCares.length <= 1) return;

    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % productCares.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [activeId, productCares.length]);

  const active = productCares.find((care) => care.id === activeId) ?? null;

  const selectCare = (id: number) => {
    setActiveId(id);
    // On stacked (mobile) layouts the list sits below the content it controls.
    if (window.matchMedia("(max-width: 767px)").matches) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h1 className="mb-12 text-center text-[20px] font-bold uppercase tracking-[2px]">
        THE CELCIUS GUIDE TO
        <br />
        PRODUCT CARE
      </h1>

      {loading ? (
        <ProductCareSkeleton />
      ) : productCares.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          Care guide not available yet.
        </p>
      ) : (
        <div className="md:flex md:justify-center">
          {/* CONTENT (LEFT) */}
          <div
            ref={topRef}
            className="mb-12 scroll-mt-6 md:mb-0 md:w-1/2 md:pr-12"
          >
            <div className="relative mb-6 aspect-square overflow-hidden">
              {productCares.map((care, index) => (
                <Image
                  key={care.id}
                  src={care.image_detail_url}
                  alt={care.material}
                  fill
                  sizes={IMAGE_SIZES}
                  priority={index === 0}
                  className={`object-cover transition-opacity duration-800 ease-in-out ${
                    index === slideIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              <AnimatePresence>
                {active && (
                  <motion.div
                    key={active.id}
                    className="absolute inset-0 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={active.image_url}
                      alt={`${active.material} detail`}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="max-w-125 text-sm">
              Everything in our collection is crafted with longevity in mind.
              Here we share tips on how to make your pieces last as long as they
              were designed to.
            </p>

            <hr className="my-12 border-black" />

            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-3 text-sm font-bold uppercase">
                  {active.material} CARE GUIDE
                </h2>
                <div
                  className="text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: active.care_instructions }}
                />
              </motion.div>
            )}
          </div>

          {/* MATERIAL LIST (RIGHT) */}
          <div className="md:w-5/12">
            <ul className="border-b border-black">
              {productCares.map((care) => (
                <li key={care.id} className="border-t border-black">
                  <button
                    type="button"
                    onClick={() => selectCare(care.id)}
                    aria-current={care.id === activeId}
                    className={`flex w-full items-center justify-between py-6 text-left text-sm uppercase hover:bg-zinc-50 ${
                      care.id === activeId ? "font-semibold" : ""
                    }`}
                  >
                    {care.material}
                    <ChevronRight size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
