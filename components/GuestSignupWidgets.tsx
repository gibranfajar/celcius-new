"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { RootState } from "@/redux/store";

const POPUP_IMAGE_URL = "https://cdn.aksacode.xyz/promo/popup.jpg";

const CARD_KEY = "guest_promo_card_dismissed";
const POPUP_KEY = "guest_promo_popup_dismissed";

// The corner card and popup are `fixed`, so they must be rendered AFTER
// <Navbar/> in the DOM: both share the z-50 stacking layer with the navbar's
// sticky mega menu, and equal z-index siblings stack by DOM order - render
// this before the navbar and the mega menu would win and cover the popup.
export default function GuestSignupWidgets() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [cardVisible, setCardVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (token) return;

    if (sessionStorage.getItem(CARD_KEY) !== "1") setCardVisible(true);

    if (sessionStorage.getItem(POPUP_KEY) !== "1") {
      const timer = setTimeout(() => setPopupVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [token]);

  if (token) return null;

  const dismissCard = () => {
    sessionStorage.setItem(CARD_KEY, "1");
    setCardVisible(false);
  };

  const dismissPopup = () => {
    sessionStorage.setItem(POPUP_KEY, "1");
    setPopupVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {cardVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] bg-white shadow-lg border border-zinc-200 p-4 seccond-font"
          >
            <button
              onClick={dismissCard}
              aria-label="Close"
              className="absolute top-2 right-2 text-zinc-400 hover:text-black transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <p className="text-xs font-medium pr-5 mb-3">
              SIGN UP FOR 10% OFF YOUR FIRST ORDER
            </p>
            <Link
              href="/register"
              className="block text-center bg-black text-white text-xs font-medium tracking-wide py-2 hover:bg-zinc-800 transition-colors"
            >
              SIGN UP
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popupVisible && (
          // A plain centered dialog, not MobileSheetModal's bottom-sheet -
          // this is a promo banner popup, so it stays centered on mobile,
          // tablet, and desktop alike instead of docking to the bottom edge.
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissPopup}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-xs sm:max-w-sm"
            >
              <Link href="/register" onClick={dismissPopup} className="block">
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
                onClick={dismissPopup}
                aria-label="Close"
                className="absolute -top-3 -right-3 bg-white text-black rounded-full p-1.5 shadow-md hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
