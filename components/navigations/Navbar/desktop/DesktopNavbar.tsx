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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { getCategories, getCollections, getLookbooks } from "@/lib/api";
import { Category, Collection, Lookbook } from "@/lib/api/types";

// The backend's `categories` endpoint has no gender/type field (only
// `master_category`: apparel/accessories/footwear), so the same category
// list is shown under both Mens and Womens - only `collections`/`lookbooks`
// (which do carry a men/women `type`) can be split per gender. Category
// links do filter real products now (`?category=slug`).
function CategoryColumns({
  categories,
  group,
  gender,
}: {
  categories: Category[];
  group: string;
  gender: "men" | "women";
}) {
  const items = categories.filter((c) => c.master_category === group);
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((category) => (
        <li key={category.id}>
          <Link
            href={`/products/${gender}/list/category/${category.slug}`}
            className="text-xs text-zinc-500 hover:text-zinc-400"
          >
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function DesktopNavbar() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenCarts, setIsOpenCarts] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Error fetching categories:", error));

    getCollections()
      .then((res) => setCollections(res.data))
      .catch((error) => console.error("Error fetching collections:", error));

    getLookbooks()
      .then((res) => setLookbooks(res.data))
      .catch((error) => console.error("Error fetching lookbooks:", error));
  }, []);

  const MEGA_MENU_CHUNK_SIZE = 5;

  const chunkedCollection = useMemo(() => {
    const chunks: Collection[][] = [];
    for (let i = 0; i < collections.length; i += MEGA_MENU_CHUNK_SIZE) {
      chunks.push(collections.slice(i, i + MEGA_MENU_CHUNK_SIZE));
    }
    return chunks;
  }, [collections]);

  const chunkedLookbooks = useMemo(() => {
    const chunks: Lookbook[][] = [];
    for (let i = 0; i < lookbooks.length; i += MEGA_MENU_CHUNK_SIZE) {
      chunks.push(lookbooks.slice(i, i + MEGA_MENU_CHUNK_SIZE));
    }
    return chunks;
  }, [lookbooks]);

  const renderGenderMenu = (gender: "men" | "women", label: string) => (
    <li className="relative group cursor-pointer text-xs tracking-wide">
      <Link href={gender === "men" ? "/" : "/women"} className="nav-link">
        {label}
      </Link>
      <div
        className="fixed left-0 right-0 top-10 bg-white -z-10 py-8 shadow-lg
          opacity-0 invisible -translate-y-1 pointer-events-none
          transition-all duration-300 ease-out
          group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
      >
        <div className="grid grid-cols-2  px-6">
          {/* Kolom Kiri: kategori */}
          <div className="grid grid-cols-3 text-sm">
            <div>
              <p className="font-semibold text-xs tracking-wide mb-3">
                APPAREL
              </p>
              <Link
                href={`/products/${gender}/list`}
                className=" text-xs text-zinc-500 hover:text-black cursor-pointer block mb-2"
              >
                View all
              </Link>
              <CategoryColumns
                categories={categories}
                group="apparel"
                gender={gender}
              />
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="font-semibold text-xs tracking-wide mb-3">
                  ACCESSORIES
                </p>
                <CategoryColumns
                  categories={categories}
                  group="accessories"
                  gender={gender}
                />
              </div>
              <div>
                <p className="font-semibold text-xs tracking-wide mb-3">
                  FOOTWEAR
                </p>
                <CategoryColumns
                  categories={categories}
                  group="footwear"
                  gender={gender}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-semibold text-xs tracking-wide mb-3">
                {label} PAGE
              </p>
              <Link
                href={`/products/${gender}/list/sale`}
                className="nav-link text-xs text-red-600 hover:text-red-500 cursor-pointer w-fit"
              >
                SALE
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: collections gender ini */}
          <div className="grid grid-cols-3 gap-4">
            {collections
              .filter((item) => item.type === gender)
              .slice(0, 3)
              .map((item) => (
                <Link
                  href={`/collection/${item.slug}`}
                  key={item.id}
                  className="flex flex-col group/tile"
                >
                  <div className="aspect-3/4 overflow-hidden bg-zinc-100">
                    <img
                      src={item.thumbnail_url}
                      alt={item.name}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-out group-hover/tile:scale-105"
                    />
                  </div>
                  <p className="text-sm mt-2 text-zinc-700 group-hover/tile:text-black transition-colors">
                    {item.name}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </li>
  );

  return (
    // The inner row carries `backdrop-blur`, not this wrapper: `backdrop-filter`
    // creates a new containing block for `position: fixed` descendants, which
    // would otherwise break CartBar/SearchBar/the overlay (all fixed, all
    // rendered further down as children of this component).
    <div className="hidden md:block sticky top-0 z-50 seccond-font">
      <div className="flex bg-white/95 backdrop-blur-sm justify-between items-center py-4 px-6 border-b border-zinc-100">
        {/* navbar kiri */}
        <ul className="flex items-center gap-6">
          {renderGenderMenu("men", "MENS")}
          {renderGenderMenu("women", "WOMENS")}

          <li className="relative group cursor-pointer text-xs tracking-wide">
            <span className="nav-link">COLLECTIONS</span>
            <div
              className="fixed left-0 right-0 top-10 bg-white -z-10 py-8 shadow-lg
              opacity-0 invisible -translate-y-1 pointer-events-none
              transition-all duration-300 ease-out
              group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
            >
              <div className=" px-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-sm tracking-wide">
                    COLLECTIONS
                  </h2>
                  <Link
                    href="/collection"
                    className="nav-link cursor-pointer text-xs text-zinc-500 w-fit"
                  >
                    View all collections
                  </Link>
                </div>

                {collections.length > 0 && (
                  <>
                    <Swiper
                      modules={[Navigation]}
                      navigation={{
                        nextEl: ".swiper-collection-next",
                        prevEl: ".swiper-collection-prev",
                      }}
                      spaceBetween={20}
                      slidesPerView={1}
                    >
                      {chunkedCollection.map((group, index) => (
                        <SwiperSlide key={index}>
                          <div className="grid grid-cols-5 gap-4">
                            {group.map((item) => (
                              <Link
                                href={`/collection/${item.slug}`}
                                key={item.id}
                                className="flex flex-col group/tile"
                              >
                                <div className="aspect-3/4 overflow-hidden bg-zinc-100">
                                  <img
                                    src={item.thumbnail_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-out group-hover/tile:scale-105"
                                  />
                                </div>
                                <p className="text-sm mt-2 text-zinc-700 group-hover/tile:text-black transition-colors">
                                  {item.name}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {chunkedCollection.length > 1 && (
                      <div className="flex justify-between gap-6 mt-4">
                        <button
                          type="button"
                          className="swiper-collection-prev cursor-pointer transition-transform hover:-translate-x-0.5"
                        >
                          <ArrowLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                          type="button"
                          className="swiper-collection-next cursor-pointer transition-transform hover:translate-x-0.5"
                        >
                          <ArrowRight className="w-6 h-6 text-gray-800" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>

          <li className="relative group cursor-pointer text-xs tracking-wide">
            <span className="nav-link">LOOKBOOK</span>
            <div
              className="fixed left-0 right-0 top-10 bg-white -z-10 py-8 shadow-lg
              opacity-0 invisible -translate-y-1 pointer-events-none
              transition-all duration-300 ease-out
              group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
            >
              <div className=" px-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-sm tracking-wide">
                    LOOKBOOK
                  </h2>
                  <Link
                    href="/lookbook"
                    className="nav-link cursor-pointer text-xs text-zinc-500 w-fit"
                  >
                    View all lookbooks
                  </Link>
                </div>

                {lookbooks.length > 0 && (
                  <>
                    <Swiper
                      modules={[Navigation]}
                      navigation={{
                        nextEl: ".swiper-lookbook-next",
                        prevEl: ".swiper-lookbook-prev",
                      }}
                      spaceBetween={20}
                      slidesPerView={1}
                    >
                      {chunkedLookbooks.map((group, index) => (
                        <SwiperSlide key={index}>
                          <div className="grid grid-cols-5 gap-4">
                            {group.map((item) => (
                              <Link
                                href={`/lookbook/${item.slug}`}
                                key={item.id}
                                className="flex flex-col group/tile"
                              >
                                <div className="aspect-3/4 overflow-hidden bg-zinc-100">
                                  <img
                                    src={item.thumbnail_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-out group-hover/tile:scale-105"
                                  />
                                </div>
                                <p className="text-sm mt-2 text-zinc-700 group-hover/tile:text-black transition-colors">
                                  {item.title}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {chunkedLookbooks.length > 1 && (
                      <div className="flex justify-between gap-6 mt-4">
                        <button
                          type="button"
                          className="swiper-lookbook-prev cursor-pointer transition-transform hover:-translate-x-0.5"
                        >
                          <ArrowLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                          type="button"
                          className="swiper-lookbook-next cursor-pointer transition-transform hover:translate-x-0.5"
                        >
                          <ArrowRight className="w-6 h-6 text-gray-800" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        </ul>

        {/* navbar tengah logo */}
        <Link href="/">
          <Image src={Logo} alt="logo" className="w-auto h-6" />
        </Link>

        {/* navbar kanan */}
        <nav className="flex items-center gap-5 text-xs tracking-wide">
          <Link href="/location" className="nav-link cursor-pointer">
            LOCATION
          </Link>
          <button
            type="button"
            className="nav-link cursor-pointer"
            onClick={() => setIsOpenSearch(true)}
          >
            SEARCH
          </button>
          <Link
            href={token ? "/dashboard" : "/login"}
            className="nav-link cursor-pointer"
          >
            {token ? "ACCOUNT" : "LOGIN"}
          </Link>
          <button
            type="button"
            className="nav-link cursor-pointer flex items-center gap-1"
            onClick={() => setIsOpenCarts(true)}
          >
            CART
            <span className="inline-flex min-w-4 justify-center text-[10px] text-zinc-500">
              ({cartItems.length || 0})
            </span>
          </button>
        </nav>
      </div>

      <div
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-300 ${
          isOpenSearch || isOpenCarts
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setIsOpenSearch(false);
          setIsOpenCarts(false);
        }}
      />

      <SearchBar isOpen={isOpenSearch} onClose={() => setIsOpenSearch(false)} />
      <CartBar isOpen={isOpenCarts} onClose={() => setIsOpenCarts(false)} />
    </div>
  );
}
