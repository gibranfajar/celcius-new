"use client";

import { useEffect, useState } from "react";
import CollectionList from "@/components/CollectionList";
import { getCollections } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { Collection as CollectionType } from "@/lib/api/types";

export default function Collection() {
  const [dataCollection, setDataCollection] = useState<CollectionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await getCollections();
        setDataCollection(res.data);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError(getErrorMessage(err));
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

      {error && (
        <div className="text-center text-red-500">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!error && <CollectionList data={dataCollection} loading={loading} />}
    </div>
  );
}
