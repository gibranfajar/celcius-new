"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/formatDate";
import { ClipLoader } from "react-spinners";
import Image from "next/image";

export default function CollectionDetail() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { slug } = useParams(); // ambil slug dari URL
  const [collection, setCollection] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}collection/detail/${slug}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch collection details");

        const data = await res.json();
        setCollection(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  // ⚠️ Error state
  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error || "Collection not found."}</p>
      </div>
    );
  }

  const { title, description, images, created_at } = collection;

  return (
    <div className="min-h-screen px-4 md:px-4 py-4 seccond-font">
      {/* Header section */}
      <div className="mx-auto mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <small>{formatDate(created_at)}</small>
            <div
              className="mt-4 leading-relaxed text-xs"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      </div>

      {/* Gallery section */}
      <div className="mx-auto">
        {images && images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {images.map((img: any) => (
              <div key={img.id} className="relative group overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${img.path}`}
                  alt={`Collection image ${img.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  width={400}
                  height={400}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">
            No images found for this collection.
          </p>
        )}
      </div>
    </div>
  );
}
