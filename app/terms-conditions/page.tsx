"use client";

import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { getPage } from "@/lib/api";
import { Page } from "@/lib/api/types";

export default function TermsConditionPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        setPage(await getPage("terms_conditions"));
      } catch (error) {
        console.error("Error fetching terms & conditions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
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
      <h2 className="text-center text-2xl font-semibold">
        {page?.title || "Terms & Conditions"}
      </h2>

      <hr className="text-zinc-300 my-6" />

      <div
        className="
          text-sm text-zinc-700
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_ul]:list-disc [&_ul]:pl-6
          [&_li]:mb-3
        "
        dangerouslySetInnerHTML={{ __html: page?.content || "" }}
      />
    </div>
  );
}
