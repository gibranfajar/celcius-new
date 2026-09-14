"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { RootState } from "@/redux/store";

const POPUP_IMAGE_URL = "https://cdn.aksacode.xyz/promo/popup.jpg";
const POPUP_KEY = "guest_promo_popup_dismissed";

// Rendered AFTER <Navbar/> in the DOM: this is `fixed` and shares the z-50
// stacking layer with the navbar's sticky mega menu - equal z-index siblings
// stack by DOM order, so rendering this before the navbar would let the
// mega menu win and cover the popup.
export default function GuestSignupPopup() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (token || sessionStorage.getItem(POPUP_KEY) === "1") return;

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [token]);

  if (token) return null;

  const dismiss = () => {
    sessionStorage.setItem(POPUP_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        // A plain centered dialog, not a bottom-sheet - this is a promo
        // banner popup, so it stays centered on mobile, tablet, and desktop
        // alike instead of docking to the bottom edge.
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-xs sm:max-w-md lg:max-w-2xl"
          >
            <Link href="/register" onClick={dismiss} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={POPUP_IMAGE_URL}
                alt="Enjoy 10% off your first order - sign up now"
                // object-contain, not object-cover: the image must never
                // be cropped or stretched, on any screen size.
                className="w-full h-auto max-h-[80vh] object-contain bg-white"
              />
            </Link>
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute -top-3 -right-3 bg-white text-black rounded-full p-1.5 shadow-md hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
