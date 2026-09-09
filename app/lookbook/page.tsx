"use client";

import { useEffect, useState } from "react";
import LookbookList from "@/components/LookbookList";
import { getLookbooks } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { Lookbook } from "@/lib/api/types";

export default function LookbookPage() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLookbooks = async () => {
      try {
        const res = await getLookbooks();
        setLookbooks(res.data);
      } catch (err) {
        console.error("Error fetching lookbooks:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchLookbooks();
  }, []);

  return (
    <div className="p-4 md:px-6 min-h-screen pt-4 seccond-font">
      <div className="flex justify-between items-center sticky top-12 z-10 bg-white">
        <h1 className="text-xl">Lookbook</h1>
      </div>

      {error && (
        <div className="text-center text-red-500">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!error && <LookbookList data={lookbooks} loading={loading} />}
    </div>
  );
}
