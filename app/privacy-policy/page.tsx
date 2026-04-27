"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function PrivacyPolicyPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState<boolean>(true);
  const [privacyPolicy, setPrivacyPolicy] = useState<any>([]);

  const fetchPrivacyPolicy = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}privacy-policy`);
      setPrivacyPolicy(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching shipping returns", err);
    }
  };

  useEffect(() => {
    fetchPrivacyPolicy();
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
      <h2 className="text-center text-2xl font-semibold">Privacy Policy</h2>

      <hr className="text-zinc-300 my-6" />

      <div
        className="
          text-sm text-zinc-700
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_ul]:list-disc [&_ul]:pl-6
          [&_li]:
        "
        dangerouslySetInnerHTML={{ __html: privacyPolicy.content }}
      />
    </div>
  );
}
