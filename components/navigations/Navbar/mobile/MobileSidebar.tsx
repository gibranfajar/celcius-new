"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import Logo from "@/public/images/logo.png";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileSidebar({ isOpen, onClose }: Props) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const token = useSelector((state: RootState) => state.auth.token);

  const [categories, setCategories] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // =====================
  // MOUNT
  // =====================
  useEffect(() => {
    setMounted(true);
  }, []);

  // =====================
  // FETCH DATA
  // =====================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catRes, campRes, collRes] = await Promise.all([
          axios.get(`${BASE_URL}categories`),
          axios.get(`${BASE_URL}campaign/list`),
          axios.get(`${BASE_URL}collection/list`),
        ]);

        setCategories(catRes.data);
        setCampaigns(campRes.data);
        setCollections(collRes.data);
      } catch (err) {
        console.error("Sidebar fetch error:", err);
      }
    };

    fetchAll();
  }, [BASE_URL]);

  if (!mounted) return null;

  // =====================
  // HELPERS
  // =====================
  const toggleMenu = (key: string) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const handleCloseAll = () => {
    setOpenMenu(null); // tutup semua accordion
    onClose(); // tutup sidebar
  };

  const renderCategoryGroup = (
    gender: "men" | "women",
    parent: string,
    title: string,
  ) => (
    <div>
      <p className="font-semibold text-sm mb-2">{title}</p>
      <ul className="space-y-1 text-sm text-zinc-700 ml-4">
        <li>
          <Link
            href={`/products/${gender}/list/${parent}`}
            onClick={handleCloseAll}
            className="text-xs hover:text-zinc-400"
          >
            View All
          </Link>
        </li>

        {categories
          .filter((c: any) => c.type === gender && c.parent === parent)
          .map((c: any) => (
            <li key={c.id}>
              <Link
                href={`/products/${gender}/list/category/${c.slug}`}
                onClick={handleCloseAll}
                className="text-xs hover:text-zinc-400"
              >
                {c.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );

  // =====================
  // RENDER
  // =====================
  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* HEADER */}
      <div className="px-4 py-[14px] flex justify-between items-center shadow">
        <Image src={Logo} alt="Celcius" className="h-6 w-auto" />
        <button onClick={onClose} className="text-xl cursor-pointer">
          <i className="bi bi-x"></i>
        </button>
      </div>

      {/* CONTENT */}
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4 space-y-4 text-sm">
        {/* SEARCH */}
        <form className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 px-4 py-2 border border-zinc-400 focus:outline-none"
          />
          <button className="bg-black text-white px-4 py-2 border border-zinc-400">
            <i className="bi bi-search" />
          </button>
        </form>

        <hr />

        <ul className="space-y-2">
          {/* MENS */}
          <li>
            <button
              onClick={() => toggleMenu("mens")}
              className="w-full flex justify-between font-semibold"
            >
              MENS
            </button>

            <div
              className={`pl-4 space-y-4 overflow-hidden transition-all duration-300 ${
                openMenu === "mens"
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {renderCategoryGroup("men", "apparel", "APPAREL")}
              {renderCategoryGroup("men", "accessories", "ACCESSORIES")}
              {renderCategoryGroup("men", "footwear", "FOOTWEAR")}

              <div>
                <p className="font-semibold text-sm mb-2">MENS PAGE</p>
                <ul className="ml-4">
                  <li>
                    <Link
                      href="/products/men/list/sale"
                      onClick={handleCloseAll}
                      className="text-xs text-red-600 hover:text-red-400"
                    >
                      SALE
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* WOMENS */}
          <li>
            <button
              onClick={() => toggleMenu("womens")}
              className="w-full flex justify-between font-semibold"
            >
              WOMENS
            </button>

            <div
              className={`pl-4 space-y-4 overflow-hidden transition-all duration-300 ${
                openMenu === "womens"
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {renderCategoryGroup("women", "apparel", "APPAREL")}
              {renderCategoryGroup("women", "accessories", "ACCESSORIES")}
              {renderCategoryGroup("women", "footwear", "FOOTWEAR")}

              <div>
                <p className="font-semibold text-sm mb-2">WOMENS PAGE</p>
                <ul className="ml-4">
                  <li>
                    <Link
                      href="/products/women/list/sale"
                      onClick={handleCloseAll}
                      className="text-xs text-red-600 hover:text-red-400"
                    >
                      SALE
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* COLLECTION */}
          <li>
            <button
              onClick={() => toggleMenu("collection")}
              className="w-full flex justify-between font-semibold"
            >
              COLLECTION
            </button>

            <div
              className={`pl-4 overflow-hidden transition-all duration-300 ${
                openMenu === "collection"
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-1 ml-4">
                {campaigns.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/campaign/${item.slug}`}
                      onClick={handleCloseAll}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* CONTENT */}
          <li>
            <button
              onClick={() => toggleMenu("content")}
              className="w-full flex justify-between font-semibold"
            >
              CONTENT
            </button>

            <div
              className={`pl-4 overflow-hidden transition-all duration-300 ${
                openMenu === "content"
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-1 ml-4">
                {collections.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/collection/${item.slug}`}
                      onClick={handleCloseAll}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>

        <hr />

        <ul className="space-y-2">
          <li>
            <Link href="/location" onClick={handleCloseAll}>
              LOCATION
            </Link>
          </li>

          <li>
            <Link
              href={token ? "/dashboard" : "/login"}
              onClick={handleCloseAll}
            >
              {token ? "ACCOUNT" : "LOGIN"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
