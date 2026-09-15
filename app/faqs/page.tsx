"use client";

import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { getFaqs } from "@/lib/api";
import { Faq } from "@/lib/api/types";

export default function Faqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        setFaqs(await getFaqs());
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-500">
            Find answers to the most common questions below.
          </p>
        </div>

        {/* ACCORDION */}
        {faqs.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No FAQs available yet.
          </p>
        ) : (
          <div className="divide-y border-t border-b">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full flex items-center justify-between text-left cursor-pointer gap-4"
                  >
                    <span className="text-base font-medium">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus size={18} className="shrink-0" />
                    ) : (
                      <Plus size={18} className="shrink-0" />
                    )}
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div
                      className="overflow-hidden text-sm text-gray-600 leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
