"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";

// Drives every "browse a paginated API" list in the app: fetches page 1,
// then auto-fetches the next page as soon as a sentinel element scrolls
// into view - no "load more" click, no page-number UI. `deps` mirrors
// useEffect's dependency list and resets pagination whenever a filter/
// search query the caller passes changes.
export function useInfiniteList<T>(
  fetchPage: (page: number) => Promise<Paginated<T>>,
  deps: React.DependencyList,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Mutable snapshot the IntersectionObserver callback reads from, so the
  // callback always sees the latest page/hasMore/busy without needing the
  // observer effect to be torn down and rebuilt on every state change.
  const stateRef = useRef({ page: 1, hasMore: false, busy: true });
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const loadPage = useCallback(async (page: number, append: boolean) => {
    stateRef.current.busy = true;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setLoadMoreError(null);

    try {
      const res = await fetchPageRef.current(page);
      setItems((prev) => (append ? [...prev, ...res.data] : res.data));
      const more = res.meta.current_page < res.meta.last_page;
      stateRef.current.page = res.meta.current_page;
      stateRef.current.hasMore = more;
      setHasMore(more);
      if (!append) setError(null);
    } catch (err) {
      if (append) {
        // Stop auto-retrying on the same page - the sentinel would keep
        // re-triggering on every intersection otherwise.
        stateRef.current.hasMore = false;
        setHasMore(false);
        setLoadMoreError(getErrorMessage(err));
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      stateRef.current.busy = false;
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    stateRef.current = { page: 1, hasMore: false, busy: true };
    setItems([]);
    setHasMore(false);
    setLoadMoreError(null);
    setError(null);

    if (!enabled) {
      setLoading(false);
      return;
    }

    loadPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  // Callback ref (not a plain ref) so the observer re-attaches whenever the
  // sentinel element itself mounts/unmounts (e.g. callers that only render
  // it once loading has finished).
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node);
  }, []);

  useEffect(() => {
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const s = stateRef.current;
        if (s.busy || !s.hasMore) return;
        loadPage(s.page + 1, true);
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [sentinelEl, loadPage]);

  // Re-fetches page 1 and replaces the list - for callers that need to
  // reflect a change made elsewhere (e.g. an order that just got paid)
  // without waiting for the next natural remount.
  const refetch = useCallback(() => {
    stateRef.current.busy = true;
    loadPage(1, false);
  }, [loadPage]);

  return { items, loading, loadingMore, hasMore, error, loadMoreError, sentinelRef, refetch };
}
