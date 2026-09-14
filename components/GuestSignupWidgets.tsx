"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { RootState } from "@/redux/store";
import MobileSheetModal from "@/components/MobileSheetModal";

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
            className="fixed bottom-4 right-4 z-40 w-64 max-w-[calc(100vw-2rem)] bg-white shadow-lg border border-zinc-200 p-4 seccond-font"
          >
            <button
              onClick={dismissCard}
              aria-label="Close"
              className="absolute top-2 right-2 text-zinc-400 hover:text-black transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <p className="text-sm font-medium pr-5 mb-3">
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
          <MobileSheetModal
            onClose={dismissPopup}
            className="sm:max-w-sm overflow-hidden"
          >
            <Link href="/register" onClick={dismissPopup} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={POPUP_IMAGE_URL}
                alt="Enjoy 10% off your first order - sign up now"
                className="w-full h-auto"
              />
            </Link>
            <button
              onClick={dismissPopup}
              aria-label="Close"
              className="absolute top-3 right-3 bg-white/90 text-black p-1.5 hover:bg-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </MobileSheetModal>
        )}
      </AnimatePresence>
    </>
  );
}
