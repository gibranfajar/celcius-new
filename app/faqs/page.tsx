"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

// The backend has no `faqs` content endpoint (only fixed `Page::KEYS` for
// legal/policy pages), so this list is maintained here directly.
const faqs = [
  {
    question: "How much is shipping?",
    answer:
      "You can get the estimated shipping cost during checkout after selecting your delivery address.",
  },
  {
    question: "How can I track my order status?",
    answer:
      "Orders ship within 3–5 business days. You can track your order by logging into your account and viewing your order history on the dashboard.",
  },
  {
    question: "Why isn't my order status updated?",
    answer:
      "Please allow up to 5 business days for tracking information to be updated after your order has been shipped.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Once an order has been placed, it cannot be modified or canceled. Please make sure all details are correct before checkout.",
  },
];

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        <div className="divide-y border-t border-b">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-base font-medium">{faq.question}</span>
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
