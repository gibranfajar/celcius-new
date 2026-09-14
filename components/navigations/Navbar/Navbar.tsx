"use client";

import { useEffect, useRef } from "react";
import DesktopNavbar from "./desktop/DesktopNavbar";
import MobileNavbar from "./mobile/MobileNavbar";
import GuestSignupBar from "@/components/GuestSignupBar";

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);

  // DesktopNavbar's mega-menu dropdowns are `fixed` at a hardcoded offset
  // from the viewport top, which only works if they know how tall this
  // sticky header actually is - and that varies (the guest signup bar above
  // the nav row can appear/disappear). Publish the real height as a CSS
  // variable so those dropdowns can position themselves against it instead
  // of an offset that assumed the bar never existed.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--nav-h",
        `${header.offsetHeight}px`,
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      <GuestSignupBar />

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNavbar />
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <MobileNavbar />
      </div>
    </header>
  );
}
