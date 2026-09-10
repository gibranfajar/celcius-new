import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Lookbook } from "@/lib/api/types";
import SkeletonImage, { Skeleton } from "@/components/SkeletonImage";

export default function LookbookList({
  data,
  loading = false,
}: {
  data: Lookbook[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-8">
            <SkeletonImage className="aspect-3/4" />
            <Skeleton className="h-3.5 w-3/4 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center gap-3 text-center py-20 text-gray-500">
        <LayoutGrid size={28} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-700">No lookbooks found.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
      {data.map((item) => (
        <Link key={item.id} href={`/lookbook/${item.slug}`} className="mb-8 group block">
          <div className="relative aspect-3/4 overflow-hidden bg-zinc-100">
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              loading="lazy"
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
          <h2 className="mt-3 text-base font-medium text-gray-800 group-hover:text-black transition-colors">
            {item.title}
          </h2>
        </Link>
      ))}
    </div>
  );
}
