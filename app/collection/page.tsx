"use client";

import CollectionList from "@/components/CollectionList";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { getCollections } from "@/lib/api";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";

export default function Collection() {
  const { items, loading, loadingMore, error, loadMoreError, sentinelRef } =
    useInfiniteList((page) => getCollections(page), []);

  return (
    <div className="p-4 md:px-6 min-h-screen pt-4 seccond-font">
      <div className="flex justify-between items-center sticky top-12 z-10 bg-white">
        <h1 className="text-xl">Collections</h1>
      </div>

      {error && (
        <div className="text-center text-red-500">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!error && (
        <>
          <CollectionList data={items} loading={loading} />
          {!loading && (
            <InfiniteScrollSentinel
              sentinelRef={sentinelRef}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
            />
          )}
        </>
      )}
    </div>
  );
}
