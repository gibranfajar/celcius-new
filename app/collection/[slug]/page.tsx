"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import Image from "next/image";
import { getCollection } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { Collection } from "@/lib/api/types";
import SkeletonImage, { Skeleton } from "@/components/SkeletonImage";

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCollection(slug);
        setCollection(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-6 py-8 seccond-font">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <Skeleton className="h-7 w-2/3 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonImage key={i} className="aspect-3/4" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error || "Collection not found."}</p>
      </div>
    );
  }

  const images = [...collection.images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen px-4 md:px-6 py-8 seccond-font">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/collection"
          className="nav-link inline-flex items-center gap-1 text-xs text-zinc-500 mb-6 w-fit"
        >
          <ArrowLeft size={13} />
          Back to Collections
        </Link>

        <div className="max-w-2xl mx-auto mb-10 text-center">
          <p className="text-[11px] tracking-widest text-zinc-400 mb-2 uppercase">
            {collection.type === "women" ? "Womens" : "Mens"} Collection
          </p>
          <h1 className="text-2xl md:text-3xl font-bold base-font">{collection.name}</h1>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-3/4 group overflow-hidden bg-zinc-100"
              >
                <Image
                  src={img.url}
                  alt={`${collection.name} image ${img.id}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
            <ImageOff size={28} className="text-gray-300" />
            <p className="text-sm">No images found for this collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
