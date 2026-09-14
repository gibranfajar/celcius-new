"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { RootState } from "@/redux/store";

const CARD_KEY = "guest_promo_card_dismissed";

// Not self-positioned (no `fixed`/`bottom-*`) - it's meant to be rendered as
// a flex child of the shared bottom-right stack (see app/layout.tsx),
// alongside WhatsAppButton, so that button naturally drops down into this
// card's spot once it's dismissed instead of floating in a gap left behind.
export default function GuestSignupCard() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!token && sessionStorage.getItem(CARD_KEY) !== "1") {
      setVisible(true);
    }
  }, [token]);

  if (token) return null;

  const dismiss = () => {
    sessionStorage.setItem(CARD_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="relative w-64 max-w-[calc(100vw-2rem)] bg-white shadow-lg border border-zinc-200 p-4 seccond-font"
        >
          <button
            onClick={dismiss}
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
  );
}
