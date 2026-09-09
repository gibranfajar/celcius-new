"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { getProductCares } from "@/lib/api";
import { ProductCare } from "@/lib/api/types";

export default function ProductCarePage() {
  const [productCares, setProductCares] = useState<ProductCare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductCares = async () => {
      setLoading(true);
      try {
        setProductCares(await getProductCares());
      } catch (error) {
        console.error("Error fetching product cares:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCares();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto seccond-font">
      <h2 className="text-center text-2xl font-semibold">Product Care</h2>
      <hr className="text-zinc-300 my-6" />

      {productCares.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Care guide not available yet.
        </p>
      ) : (
        <div className="space-y-10">
          {productCares.map((care) => (
            <div key={care.id} className="grid md:grid-cols-3 gap-6 items-start">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative aspect-square">
                  <Image
                    src={care.image_url}
                    alt={care.material}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square">
                  <Image
                    src={care.image_detail_url}
                    alt={`${care.material} detail`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">{care.material}</h3>
                <div
                  className="text-sm text-zinc-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: care.care_instructions }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
