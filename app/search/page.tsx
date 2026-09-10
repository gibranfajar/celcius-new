"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductList from "@/components/ProductList";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/api/types";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const {
    items: products,
    loading: isLoading,
    loadingMore,
    loadMoreError,
    sentinelRef,
  } = useInfiniteList<Product>(
    (page) => getProducts({ page, search: query }),
    [query],
    { enabled: !!query },
  );

  return (
    <div className="md:px-6 min-h-screen pt-4">
      <div className="px-4 md:px-0">
        <h1 className="md:text-xl">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
      </div>

      <ProductList data={products} loading={isLoading} />
      {!isLoading && query && (
        <InfiniteScrollSentinel
          sentinelRef={sentinelRef}
          loadingMore={loadingMore}
          loadMoreError={loadMoreError}
        />
      )}
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
