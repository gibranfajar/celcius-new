"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductList from "@/components/ProductList";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/api/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await getProducts({ search: query });
        setProducts(res.data);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="md:px-6 min-h-screen pt-4">
      <div className="px-4 md:px-0">
        <h1 className="md:text-xl">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
      </div>

      <ProductList data={products} loading={isLoading} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
