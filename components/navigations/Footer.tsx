"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { subscribe } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-semibold text-xs tracking-wide mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="nav-link text-xs text-zinc-500 hover:text-black">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast.error("Please agree to the Privacy and Cookies Policy first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { message } = await subscribe(email);
      toast.success(message);
      setEmail("");
      setAgreed(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="seccond-font border-t border-zinc-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <FooterColumn
            title="Shop"
            links={[
              { href: "/products/men/list", label: "Mens" },
              { href: "/products/women/list", label: "Womens" },
            ]}
          />

          <FooterColumn
            title="Celcius"
            links={[
              { href: "/about", label: "About Us" },
              { href: "/news", label: "News" },
              { href: "/location", label: "Store Locator" },
              { href: "/contact", label: "Contact Us" },
            ]}
          />

          <FooterColumn
            title="Support"
            links={[
              { href: "/faqs", label: "FAQ" },
              { href: "/shipping-returns", label: "Shipping & Returns" },
              { href: "/product-care", label: "Product Care" },
              { href: "/privacy-policy", label: "Privacy & Cookie Policy" },
              { href: "/terms-conditions", label: "Terms & Conditions" },
            ]}
          />

          <div>
            <p className="font-semibold text-xs tracking-wide mb-4">Subscribe</p>
            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
              Be the first to know about new arrivals and exclusive offers.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  name="subscribeEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-w-0 flex-1 border border-zinc-300 px-3 py-2 text-xs focus:border-black"
                  placeholder="Your email address"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shrink-0 bg-black text-white px-4 py-2 text-xs hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "..." : "Submit"}
                </button>
              </div>

              <label htmlFor="privacy" className="flex items-start gap-2 text-[11px] text-zinc-500 leading-relaxed">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <span>
                  I have read and understand the{" "}
                  <Link href="/privacy-policy" className="underline hover:text-black">
                    Privacy and Cookies Policy
                  </Link>
                </span>
              </label>
            </form>

            <div className="flex gap-4 mt-6">
              <a
                href="https://facebook.com/Celcius-IDN/100063491621453/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-zinc-500 hover:text-black transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://tiktok.com/@celcius_idn"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="text-zinc-500 hover:text-black transition-colors"
              >
                <i className="bi bi-tiktok text-[16px]" />
              </a>
              <a
                href="https://instagram.com/celcius_idn"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-zinc-500 hover:text-black transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.youtube.com/channel/UCTBavLm_Z1zr_4bxVvRAl1g"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="text-zinc-500 hover:text-black transition-colors"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col md:flex-row gap-3 justify-between items-center">
          <p className="text-[11px] text-zinc-400 text-center md:text-left">
            Direktorat Jendral Perlindungan Konsumen dan Tertib Niaga Kementerian
            Perdagangan RI 0853-1111-1010
          </p>
          <p className="text-[11px] text-zinc-400">© Celcius {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
