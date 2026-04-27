"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css";
import formatProductName from "@/lib/formatProductName";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import RelatedProduct from "@/components/RelatedProducts";
import getUserLocation from "@/lib/getUserLocation";
import getLocationDetails from "@/lib/getUserLocationDetails";
import ModalBranchStore from "@/components/ModalBranchStore";
import toast from "react-hot-toast";
import Image from "next/image";

const RESERVED_SLUGS = ["apparel", "footwear", "category", "sale"];

export default function ProductDetail() {
  const { slug } = useParams();

  // ⛔ BLOK LIST ROUTES
  if (RESERVED_SLUGS.includes(slug as string)) {
    return null;
  }
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [userLocation, setUserLocation] = useState<any | null>(null);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSection, setOpenSection] = useState<
    "details" | "sizechart" | null
  >("details");
  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}product/detail/${slug}`);
      const data = res.data;

      // Gabungkan color & article ke setiap product
      const productsWithExtras = data.product.map((p: any) => {
        const color = data.colors.find((c: any) => c.product_id === p.id);
        return {
          ...p,
          article: data.article,
          color: color ? color.color : null,
          color_code: color ? color.code : null,
        };
      });

      setDetailProduct({ ...data, product: productsWithExtras });

      const foundProduct = productsWithExtras.find((p: any) => p.slug === slug);

      // Tambahkan selectedSize (default null)
      setActiveProduct({
        ...(foundProduct || productsWithExtras[0]),
        selectedSize: null,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // request data location
  const fetchUserLocation = async () => {
    const pos = await getUserLocation();
    if (pos) {
      const { latitude, longitude } = pos.coords;
      const details = await getLocationDetails(latitude, longitude);
      setUserLocation(details);
    } else {
      console.log("User denied or location unavailable.");
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchData();
    fetchUserLocation();
  }, [slug]);

  // add to cart
  const handleAddToCart = () => {
    if (!activeProduct.selectedSize) {
      toast.error("Please select a size.");
      return;
    }

    setOpenModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  if (!detailProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="md:px-6 min-h-screen pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 base-font">
        {/* LEFT: Gambar */}
        <div className="px-4">
          <Swiper
            loop
            spaceBetween={10}
            slidesPerView={1}
            navigation
            modules={[Navigation]}
            className="product-swiper"
          >
            {activeProduct.images.map((img: any, i: number) => (
              <SwiperSlide key={i}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${img.path}`}
                  alt={activeProduct.name}
                  className="object-cover w-full"
                  width={500}
                  height={500}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* RIGHT: Detail Produk */}
        <div className="px-4">
          <h1 className="font-semibold">
            {formatProductName(activeProduct.name || "")}
          </h1>
          {/* Harga */}
          <div className="mt-2 seccond-font">
            <span className="text-sm">
              Rp {activeProduct.fix_price.toLocaleString("id-ID")}
            </span>
            {activeProduct.discount > 0 && (
              <span className="text-gray-400 line-through ml-2 text-sm">
                Rp{activeProduct.price.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          <hr className="my-4 text-zinc-200" />

          {/* Warna */}

          <div className="flex justify-between items-center">
            <span className="font-semibold text-verysmall">COLOR</span>
            <div className="flex gap-3">
              {detailProduct.colors.map((color: any) => (
                <button
                  key={color.id}
                  className={`w-6 h-6 border cursor-pointer ${
                    activeProduct.id === color.product_id
                      ? "border-black scale-110"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.code }}
                  onClick={() => {
                    const product = detailProduct.product.find(
                      (p: any) => p.id === color.product_id,
                    );
                    setActiveProduct(product);
                  }}
                  title={color.color}
                />
              ))}
            </div>
          </div>

          <hr className="my-4 text-zinc-200" />

          {/* Ukuran */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-verysmall">SIZE</span>
            <div className="flex gap-2">
              {activeProduct.sizes.map((size: any) => (
                <div
                  key={size.id}
                  onClick={() =>
                    setActiveProduct((prev: any) => ({
                      ...prev,
                      selectedSize: size.size,
                    }))
                  }
                  className={`px-2 py-1 text-verysmall flex items-center justify-center border cursor-pointer transition-all whitespace-nowrap
                      ${
                        activeProduct.selectedSize === size.size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black hover:bg-gray-100"
                      }`}
                >
                  {size.size}
                </div>
              ))}
            </div>
          </div>

          <hr className="my-4 text-zinc-200" />

          {/* Button Add to cart */}
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              className="bg-black w-full text-white py-2 px-4 hover:bg-black/80 cursor-pointer text-xs"
            >
              ADD TO CART
            </button>
          </div>

          {/*MODAL BRANCH STORE */}
          {openModal && (
            <ModalBranchStore
              onClose={() => setOpenModal(false)}
              userLocation={userLocation}
              onRequestLocation={fetchUserLocation}
              dataProduct={{
                id: activeProduct.id,
                name: activeProduct.name,
                price: activeProduct.price,
                fix_price: activeProduct.fix_price,
                article: detailProduct.article,
                color: activeProduct.color,
                size: activeProduct.selectedSize,
                image: activeProduct.images[0].path,
                weight: activeProduct.weight,
                store: activeProduct.store,
                plu: activeProduct.plu,
              }}
            />
          )}

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
                  <p>Article: {detailProduct.article}</p>
                  <p>
                    Color:{" "}
                    {formatProductName(
                      detailProduct.colors?.find(
                        (c: any) => c.product_id === activeProduct.id,
                      )?.color || "-",
                    )}
                  </p>
                  <p>Tags: {activeProduct.category?.name || "—"}</p>
                  <div
                    className="mt-6 text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: detailProduct.description,
                    }}
                  />
                </div>
              )}

              {openSection === "sizechart" && (
                <div className="animate-fade-in text-sm">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: detailProduct.sizechart,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* related product */}
      <RelatedProduct dataProduct={detailProduct.related_products} />
    </div>
  );
}
