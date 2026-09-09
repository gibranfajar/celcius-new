import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api/types";

export default function RelatedProduct({ dataProduct }: { dataProduct: Product[] }) {
  return (
    <div className="mt-6 base-font p-4 md:p-0">
      <h2 className="text-xl text-center mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {dataProduct && dataProduct.length > 0 ? (
          dataProduct.map((item) => {
            const hasDiscount = item.final_price < item.price;
            const variantImages = item.variants?.[0]?.images ?? [];
            const hoverImage = variantImages[1]?.url ?? item.thumbnail_url;

            return (
              <Link
                key={item.id}
                href={`/products/${item.type}/${item.slug}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={item.thumbnail_url}
                    loading="lazy"
                    alt={item.name}
                    className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-0"
                    width={500}
                    height={500}
                  />
                  <Image
                    src={hoverImage}
                    loading="lazy"
                    alt={item.name}
                    className="w-full h-auto object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    width={500}
                    height={500}
                  />

                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                      {item.discount_type === "percent"
                        ? `-${item.discount_value}%`
                        : "SALE"}
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition">
                    {formatProductName(item.name)}
                  </h1>

                  <div className="flex items-center gap-2 seccond-font font-semibold text-xs">
                    <span
                      className={`text-sm ${
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
          <div className="col-span-full text-center py-10 text-gray-500">
            <p className="text-lg font-medium">No related products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
