"use client";

import Link from "next/link";
import Logo from "@/public/images/logo.png";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../SearchBar";
import CartBar from "../../../CartBar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function DesktopNavbar() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = useSelector((state: RootState) => state.auth.token);

  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenCarts, setIsOpenCarts] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [dataContent, setDataContent] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${BASE_URL}campaign/list`);
        setDataCollection(response.data);
        setCampaigns(response.data);
      } catch (err: any) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchContents = async () => {
      try {
        const response = await axios.get(`${BASE_URL}collection/list`);
        setDataContent(response.data);
      } catch (err: any) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${BASE_URL}categories`);

        setCategories(response.data);
      } catch (err: any) {
        console.error("Error fetching collections:", err);
      }
    };

    fetchCategory();
    fetchCollections();
    fetchContents();
  }, []);

  const chunkedCollection = useMemo(() => {
    const chunkSize = 6;
    const chunks: any[][] = [];
    for (let i = 0; i < dataCollection.length; i += chunkSize) {
      chunks.push(dataCollection.slice(i, i + chunkSize));
    }
    return chunks;
  }, [dataCollection]);

  const chunkedContent = useMemo(() => {
    const chunkSize = 6;
    const chunks: any[][] = [];
    for (let i = 0; i < dataContent.length; i += chunkSize) {
      chunks.push(dataContent.slice(i, i + chunkSize));
    }
    return chunks;
  }, [dataContent]);

  return (
    <div className="hidden md:flex bg-white justify-between items-center py-4 px-6 sticky top-0 z-50 seccond-font">
      {/* navbar kiri */}
      <ul className="flex items-center gap-4">
        <li className="relative group cursor-pointer hover:underline text-xs">
          <Link href="/">MENS</Link>
          <div className="fixed left-0 right-0 top-[32px] bg-white -z-10 hidden group-hover:block py-6 shadow-md">
            <div className="grid grid-cols-2 w-full px-6">
              {/* Kolom Kiri: 3 kolom menu */}
              <div className="grid grid-cols-3 text-sm">
                <ul className="flex flex-col text-sm gap-1">
                  <li className="font-semibold text-sm">APPAREL</li>
                  <Link
                    href="/products/men/list/apparel"
                    className="text-xs hover:text-zinc-400 cursor-pointer"
                  >
                    View all
                  </Link>
                  {categories
                    .filter(
                      (category: any) =>
                        category.type === "men" &&
                        category.parent === "apparel",
                    )
                    .map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/products/men/list/category/${category.slug}`}
                        className="text-xs hover:text-zinc-400 cursor-pointer"
                      >
                        {category.name}
                      </Link>
                    ))}
                </ul>

                {/* 🔹 KOLOM 2: ACCESSORIES & FOOTWEAR */}
                <div className="flex flex-col gap-3">
                  <ul className="mb-3 flex flex-col gap-1">
                    <li className="font-semibold text-sm">ACCESSORIES</li>
                    <Link
                      href="/products/men/list/accessories"
                      className="text-xs hover:text-zinc-400 cursor-pointer"
                    >
                      View All
                    </Link>
                    {categories
                      .filter(
                        (category: any) =>
                          category.type === "men" &&
                          category.parent === "accessories",
                      )
                      .map((category: any) => (
                        <Link
                          key={category.id}
                          href={`/products/men/list/category/${category.slug}`}
                          className="text-xs hover:text-zinc-400 cursor-pointer"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </ul>

                  <ul className="flex flex-col gap-1">
                    <li className="font-semibold text-sm">FOOTWEAR</li>
                    <Link
                      href="/products/men/list/footwear"
                      className="text-xs hover:text-zinc-400 cursor-pointer"
                    >
                      View All
                    </Link>
                    {categories
                      .filter(
                        (category: any) =>
                          category.type === "men" &&
                          category.parent === "footwear",
                      )
                      .map((category: any) => (
                        <Link
                          key={category.id}
                          href={`/products/men/list/category/${category.slug}`}
                          className="text-xs hover:text-zinc-400 cursor-pointer"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </ul>
                </div>

                {/* 🔹 KOLOM 3: CAMPAIGN / BLOG */}
                <div className="flex flex-col gap-3">
                  <ul className="flex flex-col text-sm gap-1">
                    <li className="font-semibold text-sm">CAMPAIGN</li>
                    {campaigns
                      .filter((item) => item.type === "men")
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={`/campaign/${item.slug}`}
                          className="text-xs hover:text-zinc-400 cursor-pointer"
                        >
                          {item.title}
                        </Link>
                      ))}
                  </ul>
                  <ul className="flex flex-col text-sm gap-1">
                    <li className="font-semibold text-sm">MENS PAGE</li>
                    <Link
                      href="/products/men/list/sale"
                      className="text-xs text-red-600 hover:text-red-400 cursor-pointer"
                    >
                      SALE
                    </Link>
                  </ul>
                </div>
              </div>

              {/* Kolom Kanan: 3 gambar */}
              <div className="grid grid-cols-3 gap-4">
                {dataContent
                  .filter((item) => item.type === "men")
                  .slice(0, 3)
                  .map((item, i) => (
                    <Link
                      href={`/collection/${item.slug}`}
                      key={i}
                      className="flex flex-col"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.thumbnail}`}
                        alt={item.title}
                        className="w-full h-auto object-cover cursor-pointer"
                      />
                      <p className="text-sm mt-2">{item.title}</p>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </li>

        <li className="relative group cursor-pointer hover:underline text-xs">
          <Link href="/women">WOMENS</Link>
          <div className="fixed left-0 right-0 top-[32px] bg-white -z-10 hidden group-hover:block py-6 shadow-md">
            <div className="grid grid-cols-2 w-full px-6">
              {/* Kolom Kiri: 3 kolom menu */}
              <div className="grid grid-cols-3 text-sm">
                <ul className="flex flex-col text-sm gap-1">
                  <li className="font-semibold text-sm">APPAREL</li>
                  <Link
                    href="/products/women/list/apparel"
                    className="text-xs hover:text-zinc-400 cursor-pointer"
                  >
                    View all
                  </Link>
                  {categories
                    .filter(
                      (category: any) =>
                        category.type === "women" &&
                        category.parent === "apparel",
                    )
                    .map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/products/women/list/category/${category.slug}`}
                        className="text-xs hover:text-zinc-400 cursor-pointer"
                      >
                        {category.name}
                      </Link>
                    ))}
                </ul>

                {/* 🔹 KOLOM 2: ACCESSORIES & FOOTWEAR */}
                <div className="flex flex-col gap-3">
                  <ul className="mb-3 flex flex-col gap-1">
                    <li className="font-semibold text-sm">ACCESSORIES</li>
                    <Link
                      href="/products/women/list/accessories"
                      className="text-xs hover:text-zinc-400 cursor-pointer"
                    >
                      View All
                    </Link>
                    {categories
                      .filter(
                        (category: any) =>
                          category.type === "women" &&
                          category.parent === "accessories",
                      )
                      .map((category: any) => (
                        <Link
                          key={category.id}
                          href={`/products/women/list/category/${category.slug}`}
                          className="text-xs hover:text-zinc-400 cursor-pointer"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </ul>

                  <ul className="flex flex-col gap-1">
                    <li className="font-semibold text-sm">FOOTWEAR</li>
                    <Link
                      href="/products/women/list/footwear"
                      className="text-xs hover:text-zinc-400 cursor-pointer"
                    >
                      View All
                    </Link>
                    {categories
                      .filter(
                        (category: any) =>
                          category.type === "women" &&
                          category.parent === "footwear",
                      )
                      .map((category: any) => (
                        <Link
                          key={category.id}
                          href={`/products/women/list/category/${category.slug}`}
                          className="text-xs hover:text-zinc-400 cursor-pointer"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </ul>
                </div>

                {/* 🔹 KOLOM 3: CAMPAIGN / BLOG */}
                <div className="flex flex-col gap-3">
                  <ul className="flex flex-col text-sm gap-1">
                    <li className="font-semibold text-sm">CAMPAIGN</li>
                    {campaigns
                      .filter((item) => item.type === "women")
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={`/campaign/${item.slug}`}
                          className="text-xs hover:text-zinc-400 cursor-pointer"
                        >
                          {item.title}
                        </Link>
                      ))}
                  </ul>
                  <ul className="flex flex-col text-sm gap-1">
                    <li className="font-semibold text-sm">WOMENS PAGE</li>
                    <Link
                      href="/products/women/list/sale"
                      className="text-xs text-red-600 hover:text-red-400 cursor-pointer"
                    >
                      SALE
                    </Link>
                  </ul>
                </div>
              </div>

              {/* Kolom Kanan: 3 gambar */}
              <div className="grid grid-cols-3 gap-4">
                {dataContent
                  .filter((item) => item.type === "women")
                  .slice(0, 3)
                  .map((item, i) => (
                    <Link
                      href={`/collection/${item.slug}`}
                      key={i}
                      className="flex flex-col"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.thumbnail}`}
                        alt={item.title}
                        className="w-full h-auto object-cover cursor-pointer"
                      />
                      <p className="text-sm mt-2">{item.title}</p>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </li>

        <li className="relative group cursor-pointer hover:underline text-xs">
          COLLECTION
          <div className="fixed left-0 right-0 top-[32px] bg-white -z-10 hidden group-hover:block py-6 shadow-md">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              spaceBetween={20}
              slidesPerView={1}
            >
              {chunkedCollection.map((group, index) => (
                <SwiperSlide key={index}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-6">
                    {group.map((item, i) => (
                      <Link
                        href={`/campaign/${item.slug}`}
                        key={i}
                        className="flex flex-col"
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.thumbnail}`}
                          alt={`collection-${item.title}`}
                          className="w-full h-auto object-cover cursor-pointer"
                        />
                        <p className="text-sm mt-2">{item.title}</p>
                      </Link>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* navigation */}
            <div className="flex justify-between gap-6 mt-4 px-6">
              <button
                type="button"
                className="swiper-button-prev-custom cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                type="button"
                className="swiper-button-next-custom cursor-pointer"
              >
                <ArrowRight className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>
        </li>

        <li className="relative group cursor-pointer hover:underline text-xs">
          CONTENT
          <div className="fixed left-0 right-0 top-[32px] bg-white -z-10 hidden group-hover:block py-6 shadow-md">
            <div className="grid grid-cols-12">
              <div className="col-span-10">
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    nextEl: ".swiper-button-next-custom",
                    prevEl: ".swiper-button-prev-custom",
                  }}
                  spaceBetween={20}
                  slidesPerView={1}
                >
                  {chunkedContent.map((group, index) => (
                    <SwiperSlide key={index}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-6">
                        {group.map((item, i) => (
                          <Link
                            href={`/collection/${item.slug}`}
                            key={i}
                            className="flex flex-col"
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.thumbnail}`}
                              alt={`collection-${item.slug}`}
                              className="w-full h-auto object-cover cursor-pointer"
                            />
                            <p className="text-sm mt-2">{item.title}</p>
                          </Link>
                        ))}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* navigation */}
                <div className="flex justify-between gap-6 mt-4 px-6">
                  <button
                    type="button"
                    className="swiper-button-prev-custom cursor-pointer"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    type="button"
                    className="swiper-button-next-custom cursor-pointer"
                  >
                    <ArrowRight className="w-6 h-6 text-gray-800" />
                  </button>
                </div>
              </div>
              {/* content kanan */}
              <div className="col-span-2">
                <h1 className="font-bold">Celcius</h1>
                <Link
                  href="/collection"
                  className="hover:text-zinc-400 cursor-pointer text-sm"
                >
                  View All Post
                </Link>
              </div>
            </div>
          </div>
        </li>
      </ul>

      {/* navbar tengah logo */}
      <Link href="/">
        <Image src={Logo} alt="logo" className="w-auto h-6" />
      </Link>

      {/* navbar kanan */}
      <ul className="flex items-center gap-4">
        <Link href="/location" className="hover:underline">
          <li className="cursor-pointer text-xs">LOCATION</li>
        </Link>
        <li
          className="cursor-pointer text-xs hover:underline"
          onClick={() => setIsOpenSearch(true)}
        >
          SEARCH
        </li>
        <Link
          href={token ? "/dashboard" : "/login"}
          className="hover:underline"
        >
          {token ? (
            <li className="cursor-pointer text-xs">ACCOUNT</li>
          ) : (
            <li className="cursor-pointer text-xs">LOGIN</li>
          )}
        </Link>
        <li
          className="cursor-pointer text-xs hover:underline"
          onClick={() => setIsOpenCarts(true)}
        >
          CART({cartItems.length || 0})
        </li>
      </ul>

      {(isOpenSearch || isOpenCarts) && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => {
            setIsOpenSearch(false);
            setIsOpenCarts(false);
          }}
        />
      )}

      {/* search modal */}
      <SearchBar isOpen={isOpenSearch} onClose={() => setIsOpenSearch(false)} />
      {/* cart modal */}
      <CartBar isOpen={isOpenCarts} onClose={() => setIsOpenCarts(false)} />
    </div>
  );
}
