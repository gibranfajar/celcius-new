"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";
import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import { getProduct, getProducts } from "@/lib/api";
import { Product, ProductSize } from "@/lib/api/types";
import RelatedProduct from "@/components/RelatedProducts";
import SkeletonImage from "@/components/SkeletonImage";
import toast from "react-hot-toast";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSection, setOpenSection] = useState<
    "details" | "sizechart" | null
  >("details");

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getProduct(slug);
        setProduct(data);
        setActiveVariantIndex(0);
        setSelectedSize(null);

        const list = await getProducts();
        setRelatedProducts(
          list.data
            .filter((p) => p.type === data.type && p.slug !== data.slug)
            .slice(0, 4),
        );
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const activeVariant = product?.variants?.[activeVariantIndex];

  const handleAddToCart = () => {
    if (!product || !activeVariant) return;

    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }

    dispatch(
      addToCart({
        productSizeId: selectedSize.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: activeVariant.color.name,
        size: selectedSize.size,
        thumbnailUrl: activeVariant.thumbnail_url,
        price: product.price,
        finalPrice: product.final_price,
        weight: product.weight ?? 0,
        stock: selectedSize.stock,
      }),
    );

    toast.success("Added to cart.");
  };

  if (isLoading) {
    return (
      <div className="md:px-6 min-h-screen pt-4 animate-pulse mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="px-4">
            <SkeletonImage className="aspect-square" />
          </div>
          <div className="px-4 space-y-4">
            <div className="h-5 w-2/3 bg-gray-200" />
            <div className="h-4 w-1/4 bg-gray-100" />
            <div className="h-px bg-gray-100 my-6" />
            <div className="h-4 w-1/3 bg-gray-100" />
            <div className="h-px bg-gray-100 my-6" />
            <div className="h-10 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !activeVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  const hasDiscount = product.final_price < product.price;

  return (
    <div className="md:px-6 min-h-screen pt-4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 base-font">
        {/* LEFT: Gambar */}
        <div className="px-4 md:px-0">
          <Swiper
            key={activeVariant.id}
            loop={activeVariant.images.length > 1}
            spaceBetween={10}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            className="product-swiper"
          >
            {(activeVariant.images.length > 0
              ? activeVariant.images
              : [{ id: 0, url: activeVariant.thumbnail_url, sort_order: 0 }]
            ).map((img) => (
              <SwiperSlide key={img.id}>
                <div className="relative aspect-square bg-zinc-100">
                  <Image
                    src={img.url}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* RIGHT: Detail Produk */}
        <div className="px-4 md:px-0">
          <h1 className="text-lg md:text-xl font-semibold">
            {formatProductName(product.name)}
          </h1>
          {/* Harga */}
          <div className="mt-2 seccond-font flex items-baseline gap-2">
            <span className="text-lg font-semibold">
              {formatToIdr(product.final_price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-gray-400 line-through text-sm">
                  {formatToIdr(product.price)}
                </span>
                <span className="text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5">
                  {product.discount_type === "percent"
                    ? `-${product.discount_value}%`
                    : "SALE"}
                </span>
              </>
            )}
          </div>

          <hr className="my-4 text-zinc-200" />

          {/* Warna */}
          {product.variants && product.variants.length > 1 && (
            <>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-verysmall">COLOR</span>
                <div className="flex gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      className={`w-6 h-6 border cursor-pointer ${
                        activeVariantIndex === index
                          ? "border-black scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: variant.color.code }}
                      onClick={() => {
                        setActiveVariantIndex(index);
                        setSelectedSize(null);
                      }}
                      title={variant.color.name}
                    />
                  ))}
                </div>
              </div>

              <hr className="my-4 text-zinc-200" />
            </>
          )}

          {/* Ukuran */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-verysmall">SIZE</span>
            <div className="flex gap-2 flex-wrap justify-end">
              {activeVariant.sizes.map((size) => {
                const outOfStock = size.stock <= 0;
                return (
                  <div
                    key={size.id}
                    onClick={() => !outOfStock && setSelectedSize(size)}
                    className={`px-2 py-1 text-verysmall flex items-center justify-center border transition-all whitespace-nowrap
                      ${outOfStock ? "cursor-not-allowed opacity-40 line-through" : "cursor-pointer"}
                      ${
                        selectedSize?.id === size.id
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black hover:bg-gray-100"
                      }`}
                  >
                    {size.size}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="my-4 text-zinc-200" />

          {/* Button Add to cart */}
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              disabled={activeVariant.total_stock <= 0}
              className="bg-black w-full text-white py-3 px-4 hover:bg-zinc-800 cursor-pointer text-xs tracking-wide font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {activeVariant.total_stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
          </div>

          {/* DROPDOWN DETAIL DAN SIZECHART */}
          <div className="mt-6 border-t border-gray-200">
            {/* BUTTONS */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() =>
                  setOpenSection(openSection === "details" ? null : "details")
                }
                className={`flex-1 text-verysmall py-2 text-center transition cursor-pointer ${
                  openSection === "details"
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                DETAILS
              </button>
              <button
                onClick={() =>
                  setOpenSection(
                    openSection === "sizechart" ? null : "sizechart",
                  )
                }
                className={`flex-1 text-verysmall py-2 text-center transition cursor-pointer ${
                  openSection === "sizechart"
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                SIZE CHART
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-4 text-sm leading-relaxed seccond-font">
              {openSection === "details" && (
                <div className="space-y-1 text-sm animate-fade-in">
                  <p>Article: {product.article}</p>
                  <p>Color: {formatProductName(activeVariant.color.name)}</p>
                  {product.categories && product.categories.length > 0 && (
                    <p>
                      Tags: {product.categories.map((c) => c.name).join(", ")}
                    </p>
                  )}
                  {product.description && (
                    <div
                      className="mt-6 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  )}

                  {product.product_cares &&
                    product.product_cares.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <p className="font-semibold text-verysmall">
                          CARE INSTRUCTIONS
                        </p>
                        {product.product_cares.map((care) => (
                          <div key={care.id}>
                            <p className="font-medium">{care.material}</p>
                            <div
                              className="text-gray-700 [&_ul]:list-disc [&_ul]:pl-6"
                              dangerouslySetInnerHTML={{
                                __html: care.care_instructions,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {openSection === "sizechart" && product.sizechart && (
                <div className="animate-fade-in text-sm">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.sizechart }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* related product */}
      <RelatedProduct dataProduct={relatedProducts} />
    </div>
  );
}
