import Link from "next/link";
import { formatToIdr } from "@/lib/formatToIdr";
import formatProductName from "@/lib/formatProductName";
import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { Product } from "@/lib/api/types";
import SkeletonImage from "@/components/SkeletonImage";

export default function ProductList({
  data,
  loading,
}: {
  data: Product[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid px-4 grid-cols-2 md:grid-cols-3 gap-4 md:px-0 animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i}>
            <SkeletonImage className="aspect-2/3" />
            <div className="h-3 w-3/4 bg-gray-200 mt-3 mb-2" />
            <div className="h-3 w-1/3 bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid px-4 grid-cols-2 md:grid-cols-3 gap-4 md:px-0">
      {data && data.length > 0 ? (
        data.map((item) => {
          const hasDiscount = item.final_price < item.price;
          const variantImages = item.variants?.[0]?.images ?? [];
          const hoverImage = variantImages[1]?.url ?? item.thumbnail_url;

          return (
            <Link
              key={item.id}
              href={`/products/${item.type}/${item.slug}`}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden bg-zinc-100">
                <Image
                  src={item.thumbnail_url}
                  loading="lazy"
                  alt={item.name}
                  className="w-full h-auto object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
                  width={500}
                  height={500}
                />
                <Image
                  src={hoverImage}
                  loading="lazy"
                  alt={item.name}
                  className="w-full h-auto object-cover absolute top-0 left-0 transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100"
                  width={500}
                  height={500}
                />

                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] tracking-wide font-semibold px-2 py-1">
                    {item.discount_type === "percent"
                      ? `-${item.discount_value}%`
                      : "SALE"}
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-1">
                <h1 className="text-sm font-medium line-clamp-2 text-zinc-800 group-hover:text-black transition-colors base-font">
                  {formatProductName(item.name)}
                </h1>

                <div className="flex items-center gap-2 font-semibold seccond-font">
                  <span
                    className={`text-xs ${
                      hasDiscount ? "text-black" : "text-gray-900"
                    }`}
                  >
                    {formatToIdr(item.final_price)}
                  </span>

                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatToIdr(item.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })
      ) : (
        <div className="col-span-full flex flex-col items-center gap-3 text-center py-20 text-gray-500">
          <PackageSearch size={28} className="text-gray-300" />
          <div>
            <p className="text-sm font-medium text-gray-700">No products found.</p>
            <p className="text-xs mt-1">Try changing the category or product type filter.</p>
          </div>
        </div>
      )}
    </div>
  );
}
