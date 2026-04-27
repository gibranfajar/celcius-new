"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ShippingReturnsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState<boolean>(true);
  const [shippingReturns, setShippingReturns] = useState<any>([]);

  const fetchShippingReturn = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}shipping-returns`);
      setShippingReturns(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching shipping returns", err);
    }
  };

  useEffect(() => {
    fetchShippingReturn();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto">
      <h2 className="text-center text-2xl font-semibold">Return & Exchange</h2>

      <hr className="text-zinc-300 my-6" />

      <div
        className="
          text-sm text-zinc-700
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_ul]:list-disc [&_ul]:pl-6
          [&_li]:mb-3
        "
        dangerouslySetInnerHTML={{ __html: shippingReturns.content }}
      />
    </div>
  );
}
