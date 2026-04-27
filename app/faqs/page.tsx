"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

// const faqs = [
//   {
//     question: "How much is shipping?",
//     answer:
//       "You can get the estimated shipping cost during checkout after selecting your delivery address.",
//   },
//   {
//     question: "How can I track my order status?",
//     answer:
//       "Orders ship within 3–5 business days. You can track your order by logging into your account. If you checked out as a guest, please contact customer service.",
//   },
//   {
//     question: "Why isn’t my order status updated?",
//     answer:
//       "Please allow up to 5 business days for tracking information to be updated after your order has been shipped.",
//   },
//   {
//     question: "Can I change or cancel my order?",
//     answer:
//       "Once an order has been placed, it cannot be modified or canceled. Please make sure all details are correct before checkout.",
//   },
// ];

export default function Faqs() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [faqs, setFaqs] = useState<any[]>([]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}faqs`);
      setFaqs(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching faqs", err);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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

                {/* ANSWER */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div
                    className="overflow-hidden text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
