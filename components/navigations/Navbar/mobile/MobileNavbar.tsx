"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

import Logo from "@/public/images/logo.png";
import CartBar from "../../../CartBar";
import MobileSidebar from "./MobileSidebar";

export default function MobileNavbar() {
  const [isOpenCart, setIsOpenCart] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  return (
    <div className="md:hidden sticky top-0 z-50 bg-white seccond-font">
      <div className="flex items-center justify-between px-4 py-3">
        {/* LEFT: Hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          className="p-1 text-xs"
          onClick={() => setIsOpenSidebar(true)}
        >
          MENU
          {/* <Menu className="w-6 h-6 text-black" /> */}
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
          className="text-xs tracking-wide"
        >
          BAG({cartItems.length || 0})
        </button>
      </div>

      {/* OVERLAY (cart + sidebar) */}
      {(isOpenCart || isOpenSidebar) && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => {
            setIsOpenCart(false);
            setIsOpenSidebar(false);
          }}
        />
      )}

      {/* SIDEBAR MENU */}
      <MobileSidebar
        isOpen={isOpenSidebar}
        onClose={() => setIsOpenSidebar(false)}
      />

      {/* CART SIDEBAR */}
      <CartBar isOpen={isOpenCart} onClose={() => setIsOpenCart(false)} />
    </div>
  );
}
