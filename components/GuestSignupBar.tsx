"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { X } from "lucide-react";
import { RootState } from "@/redux/store";

const BAR_KEY = "guest_promo_bar_dismissed";

// Rendered before <Navbar/> (normal document flow, not fixed) so it sits
// visually above it. Kept as its own component - separate from
// GuestSignupWidgets - because the popup/card there are `fixed` and must come
// AFTER <Navbar/> in the DOM for their z-index to win over its sticky mega
// menu; this one has no such stacking concern.
export default function GuestSignupBar() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!token && sessionStorage.getItem(BAR_KEY) !== "1") {
      setVisible(true);
    }
  }, [token]);

  if (token || !visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(BAR_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="relative bg-black text-white text-center text-[11px] sm:text-xs tracking-wide py-2.5 px-9 seccond-font">
      <Link href="/register" className="hover:underline">
        ENJOY 10% OFF YOUR FIRST ORDER — SIGN UP NOW
      </Link>
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors cursor-pointer p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
