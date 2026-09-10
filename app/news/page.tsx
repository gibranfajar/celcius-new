"use client";

import Image from "next/image";
import { Newspaper } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { getNews } from "@/lib/api";
import { News } from "@/lib/api/types";
import SkeletonImage, { Skeleton } from "@/components/SkeletonImage";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";

function NewsArticle({ item }: { item: News }) {
  const images = [...item.images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <article>
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <p className="text-[11px] tracking-widest text-zinc-400 mb-2 uppercase">
          {formatDate(item.created_at)}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold base-font">{item.title}</h1>
        <div
          className="mt-4 leading-relaxed text-sm text-zinc-600"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-3/4 overflow-hidden bg-zinc-100"
            >
              <Image
                src={img.url}
                alt={`${item.title} image ${img.id}`}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative aspect-21/9 overflow-hidden bg-zinc-100 max-w-4xl mx-auto">
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
    </article>
  );
}

export default function NewsPage() {
  const { items: news, loading, loadingMore, loadMoreError, sentinelRef } =
    useInfiniteList<News>((page) => getNews(page), []);

  return (
    <div className="min-h-screen px-4 md:px-6 py-8 seccond-font">
      <div className="max-w-6xl mx-auto">
        {!loading && (
          <h1 className="text-2xl md:text-3xl font-bold base-font text-center mb-10">
            News
          </h1>
        )}

        {loading ? (
          <div className="space-y-16">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="max-w-2xl mx-auto mb-8 text-center space-y-3">
                  <Skeleton className="h-3 w-20 mx-auto" />
                  <Skeleton className="h-7 w-2/3 mx-auto" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <SkeletonImage key={j} className="aspect-3/4" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-gray-500 py-16">
            <Newspaper size={28} className="text-gray-300" />
            <p className="text-sm">No news yet.</p>
          </div>
        ) : (
          <>
            <div className="space-y-20">
              {news.map((item) => (
                <NewsArticle key={item.id} item={item} />
              ))}
            </div>
            <InfiniteScrollSentinel
              sentinelRef={sentinelRef}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
            />
          </>
        )}
      </div>
    </div>
  );
}
