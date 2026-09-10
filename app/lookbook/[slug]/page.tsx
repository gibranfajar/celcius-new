"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import Image from "next/image";
import { getLookbook } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { Lookbook } from "@/lib/api/types";
import SkeletonImage, { Skeleton } from "@/components/SkeletonImage";

export default function LookbookDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [lookbook, setLookbook] = useState<Lookbook | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        setLookbook(await getLookbook(slug));
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
        <div className="max-w-2xl mx-auto mb-8 text-center space-y-3">
          <Skeleton className="h-3 w-16 mx-auto" />
          <Skeleton className="h-7 w-2/3 mx-auto" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonImage key={i} className="aspect-3/4" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !lookbook) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error || "Lookbook not found."}</p>
      </div>
    );
  }

  const images = [...lookbook.images].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div className="min-h-screen px-4 md:px-6 py-8 seccond-font">
      <div className="mx-auto">
        {/* <Link
          href="/lookbook"
          className="nav-link inline-flex items-center gap-1 text-xs text-zinc-500 mb-6 w-fit"
        >
          <ArrowLeft size={13} />
          Back to Lookbook
        </Link> */}

        <div className="max-w-4xl mx-auto mb-10 text-center">
          <p className="text-[11px] tracking-widest text-zinc-400 mb-2 uppercase">
            {lookbook.type === "women" ? "Womens" : "Mens"} Lookbook
          </p>
          <h1 className="text-2xl md:text-3xl font-bold base-font">
            {lookbook.title}
          </h1>
          {lookbook.description && (
            <div
              className="mt-4 leading-relaxed text-sm text-zinc-600"
              dangerouslySetInnerHTML={{ __html: lookbook.description }}
            />
          )}
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
                  alt={`${lookbook.title} image ${img.id}`}
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
            <p className="text-sm">No images found for this lookbook.</p>
          </div>
        )}
      </div>
    </div>
  );
}
