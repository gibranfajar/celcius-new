"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

import Logo from "@/public/images/logo.png";
import CartBar from "../../../CartBar";
import SearchBar from "../../../SearchBar";
import MobileSidebar from "./MobileSidebar";

export default function MobileNavbar() {
  const [isOpenCart, setIsOpenCart] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  return (
    // The inner row carries `backdrop-blur`, not this wrapper: `backdrop-filter`
    // creates a new containing block for `position: fixed` descendants, which
    // would otherwise break MobileSidebar/CartBar/SearchBar/the overlay (all
    // fixed, all rendered further down as children of this component).
    <div className="md:hidden sticky top-0 z-50 seccond-font">
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        {/* LEFT: Hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          className="p-1 -ml-1 text-xs tracking-wide cursor-pointer active:opacity-60"
          onClick={() => setIsOpenSidebar(true)}
        >
          MENU
        </button>

        {/* CENTER: Logo */}
        <Link href="/">
          <Image
            src={Logo}
            alt="Celcius Logo"
            className="h-6 w-auto"
            priority
          />
        </Link>

        {/* RIGHT: Cart */}
        <button
          type="button"
          onClick={() => setIsOpenCart(true)}
          className="text-xs tracking-wide cursor-pointer active:opacity-60"
        >
          BAG({cartItems.length || 0})
        </button>
      </div>

      {/* OVERLAY (cart + sidebar + search) */}
      <div
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-300 ${
          isOpenCart || isOpenSidebar || isOpenSearch
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setIsOpenCart(false);
          setIsOpenSidebar(false);
          setIsOpenSearch(false);
        }}
      />

      {/* SIDEBAR MENU */}
      <MobileSidebar
        isOpen={isOpenSidebar}
        onClose={() => setIsOpenSidebar(false)}
        onOpenSearch={() => setIsOpenSearch(true)}
      />

      {/* SEARCH */}
      <SearchBar isOpen={isOpenSearch} onClose={() => setIsOpenSearch(false)} />

      {/* CART SIDEBAR */}
      <CartBar isOpen={isOpenCart} onClose={() => setIsOpenCart(false)} />
    </div>
  );
}
