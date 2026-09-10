"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import Logo from "@/public/images/logo.png";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchAllPages, getCategories, getCollections, getLookbooks } from "@/lib/api";
import { Category, Collection, Lookbook } from "@/lib/api/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
};

export default function MobileSidebar({ isOpen, onClose, onOpenSearch }: Props) {
  const token = useSelector((state: RootState) => state.auth.token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Error fetching categories:", error));

    fetchAllPages(getCollections)
      .then(setCollections)
      .catch((error) => console.error("Error fetching collections:", error));

    fetchAllPages(getLookbooks)
      .then(setLookbooks)
      .catch((error) => console.error("Error fetching lookbooks:", error));
  }, []);

  if (!mounted) return null;

  const toggleMenu = (key: string) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const handleCloseAll = () => {
    setOpenMenu(null);
    onClose();
  };

  // The backend's categories have no gender/type field (only
  // `master_category`), so the same category list is shown regardless of
  // the selected gender - only "View All" links are gender-specific.
  // Category links do filter real products now (`?category=slug`).
  const renderCategoryGroup = (gender: "men" | "women", group: string, title: string) => (
    <div>
      <p className="font-semibold text-xs tracking-wide mb-2 text-zinc-400">{title}</p>
      <ul className="space-y-2 text-sm ml-1">
        <li>
          <Link
            href={`/products/${gender}/list`}
            onClick={handleCloseAll}
            className="nav-link text-xs w-fit"
          >
            View All
          </Link>
        </li>

        {categories
          .filter((c) => c.master_category === group)
          .map((c) => (
            <li key={c.id}>
              <Link
                href={`/products/${gender}/list/category/${c.slug}`}
                onClick={handleCloseAll}
                className="nav-link text-xs text-zinc-500 w-fit"
              >
                {c.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );

  const SectionToggle = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => toggleMenu(id)}
      className="w-full flex justify-between items-center py-3 font-semibold text-sm tracking-wide cursor-pointer"
    >
      {label}
      <ChevronDown
        size={16}
        className={`text-zinc-400 transition-transform duration-300 ${
          openMenu === id ? "rotate-180" : ""
        }`}
      />
    </button>
  );

  return (
    <div
      className={`fixed top-0 left-0 h-full w-[85vw] max-w-80 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* HEADER */}
      <div className="px-4 py-3.5 flex justify-between items-center border-b border-zinc-100">
        <Image src={Logo} alt="Celcius" className="h-6 w-auto" />
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="cursor-pointer text-zinc-500 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="h-[calc(100%-56px)] overflow-y-auto px-4 py-2 text-sm">
        <div className="divide-y divide-zinc-100">
          {/* MENS */}
          <div>
            <SectionToggle id="mens" label="MENS" />

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "mens" ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-4 pt-1">
                {renderCategoryGroup("men", "apparel", "APPAREL")}
                {renderCategoryGroup("men", "accessories", "ACCESSORIES")}
                {renderCategoryGroup("men", "footwear", "FOOTWEAR")}

                <Link
                  href="/products/men/list/sale"
                  onClick={handleCloseAll}
                  className="nav-link inline-block text-xs text-red-600 w-fit"
                >
                  SALE
                </Link>
              </div>
            </div>
          </div>

          {/* WOMENS */}
          <div>
            <SectionToggle id="womens" label="WOMENS" />

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "womens" ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-4 pt-1">
                {renderCategoryGroup("women", "apparel", "APPAREL")}
                {renderCategoryGroup("women", "accessories", "ACCESSORIES")}
                {renderCategoryGroup("women", "footwear", "FOOTWEAR")}

                <Link
                  href="/products/women/list/sale"
                  onClick={handleCloseAll}
                  className="nav-link inline-block text-xs text-red-600 w-fit"
                >
                  SALE
                </Link>
              </div>
            </div>
          </div>

          {/* COLLECTIONS */}
          <div>
            <SectionToggle id="collections" label="COLLECTIONS" />

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "collections" ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-2.5 pt-1">
                {collections.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/collection/${item.slug}`}
                      onClick={handleCloseAll}
                      className="nav-link text-sm w-fit"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LOOKBOOK */}
          <div>
            <SectionToggle id="lookbook" label="LOOKBOOK" />

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openMenu === "lookbook" ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-2.5 pt-1">
                {lookbooks.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/lookbook/${item.slug}`}
                      onClick={handleCloseAll}
                      className="nav-link text-sm w-fit"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ul className="pt-4 space-y-3">
          <li>
            <button
              onClick={() => {
                setOpenMenu(null);
                onClose();
                onOpenSearch();
              }}
              className="nav-link flex items-center gap-2 text-sm font-semibold tracking-wide w-fit cursor-pointer"
            >
              <Search size={15} />
              SEARCH
            </button>
          </li>

          <li>
            <Link
              href="/location"
              onClick={handleCloseAll}
              className="nav-link text-sm font-semibold tracking-wide w-fit"
            >
              LOCATION
            </Link>
          </li>

          <li>
            <Link
              href={token ? "/dashboard" : "/login"}
              onClick={handleCloseAll}
              className="nav-link text-sm font-semibold tracking-wide w-fit"
            >
              {token ? "ACCOUNT" : "LOGIN"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
