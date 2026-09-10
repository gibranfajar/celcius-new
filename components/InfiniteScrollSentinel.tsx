import { Loader2 } from "lucide-react";

// Invisible trigger element for useInfiniteList: render it right after a
// paginated list so the hook's IntersectionObserver can see it scroll into
// view and auto-fetch the next page.
export default function InfiniteScrollSentinel({
  sentinelRef,
  loadingMore,
  loadMoreError,
}: {
  sentinelRef: (node: HTMLDivElement | null) => void;
  loadingMore: boolean;
  loadMoreError: string | null;
}) {
  return (
    <div ref={sentinelRef} className="flex justify-center py-8">
      {loadingMore && <Loader2 className="animate-spin text-zinc-400" size={20} />}
      {loadMoreError && (
        <p className="text-xs text-red-500">⚠️ {loadMoreError}</p>
      )}
    </div>
  );
}
