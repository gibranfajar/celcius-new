"use client";

import { useEffect, useState } from "react";
import CollectionList from "@/components/CollectionList";
import { ClipLoader } from "react-spinners";

export default function Collection() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch(`${BASE_URL}collection/list`, {
          cache: "no-store", // biar data terbaru terus
        });
        if (!res.ok) throw new Error("Failed to fetch collections");

        const data = await res.json();
        setDataCollection(data);
      } catch (err: any) {
        console.error("Error fetching collections:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="p-4 md:px-6 min-h-screen pt-4 seccond-font">
      <div className="flex justify-between items-center sticky top-12 z-10 bg-white">
        <h1 className="text-xl">Collections</h1>
      </div>

      {/* Kondisi Loading */}
      {loading && (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          <ClipLoader />
        </div>
      )}

      {/* Kondisi Error */}
      {error && (
        <div className="text-center text-red-500">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Data */}
      {!loading && !error && <CollectionList data={dataCollection} />}
    </div>
  );
}
