import Link from "next/link";
import { formatToIdr } from "@/lib/formatToIdr";
import { ClipLoader } from "react-spinners";
import formatProductName from "@/lib/formatProductName";
import Image from "next/image";

export default function ProductList({ data, loading }: any) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader size={40} color="#000" />
      </div>
    );
  }

  return (
    <div className="grid px-4 grid-cols-2 md:grid-cols-3 gap-4 md:px-0">
      {data && data.length > 0 ? (
        data.map((item: any, index: number) => {
          const hasDiscount = item.discount > 0;
          const finalPrice = hasDiscount
            ? item.price - (item.price * item.discount) / 100
            : item.price;

          return (
            <Link
              key={index}
              href={`/products/${item.type}/${item.slug}`}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={item.image1}
                  loading="lazy"
                  alt={item.name}
                  className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-0"
                  width={500}
                  height={500}
                />
                <Image
                  src={item.image2}
                  loading="lazy"
                  alt={item.name}
                  className="w-full h-auto object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  width={500}
                  height={500}
                />

                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                    -{item.discount}%
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <h1 className="text-sm font-medium line-clamp-2 group-hover:text-gray-700 transition base-font">
                  {formatProductName(item.name)}
                </h1>

                <div className="flex items-center gap-2 font-semibold seccond-font">
                  <span
                    className={`text-xs ${
                      hasDiscount ? "text-black" : "text-gray-900"
                    }`}
                  >
                    {formatToIdr(finalPrice)}
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
          <p className="text-lg font-medium">Product not found.</p>
          <p className="text-sm">
            Try changing the category or product type filter.
          </p>
        </div>
      )}
    </div>
  );
}
