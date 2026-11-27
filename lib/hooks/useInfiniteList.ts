"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import { readCache, writeCache } from "@/lib/pageCache";

/** What a cached list remembers: every page loaded so far. */
type CachedList<T> = { items: T[]; page: number; hasMore: boolean };

// Drives every "browse a paginated API" list in the app: fetches page 1,
// then auto-fetches the next page as soon as a sentinel element scrolls
// into view - no "load more" click, no page-number UI. `deps` mirrors
// useEffect's dependency list and resets pagination whenever a filter/
// search query the caller passes changes.
//
// `cacheKey` (unique per list and filter) keeps the loaded pages in memory:
// coming back to the list (e.g. Back from a product) shows every page that
// was loaded at once, so the scroll position can be restored immediately.
// Leave it out for data that must always be fresh, such as orders.
export function useInfiniteList<T>(
  fetchPage: (page: number) => Promise<Paginated<T>>,
  deps: React.DependencyList,
  options: { enabled?: boolean; cacheKey?: string } = {},
) {
  const { enabled = true, cacheKey } = options;
  const listKey = cacheKey ? `list:${cacheKey}` : null;
  const [initial] = useState(() =>
    enabled && listKey ? readCache<CachedList<T>>(listKey) : undefined,
  );
  const [items, setItems] = useState<T[]>(initial?.items ?? []);
  const [loading, setLoading] = useState(!initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Mutable snapshot the IntersectionObserver callback reads from, so the
  // callback always sees the latest page/hasMore/busy without needing the
  // observer effect to be torn down and rebuilt on every state change.
  const stateRef = useRef(
    initial
      ? { page: initial.page, hasMore: initial.hasMore, busy: false }
      : { page: 1, hasMore: false, busy: true },
  );
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;
  const listKeyRef = useRef(listKey);
  listKeyRef.current = listKey;

  const loadPage = useCallback(async (page: number, append: boolean) => {
    stateRef.current.busy = true;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setLoadMoreError(null);
    const keyAtStart = listKeyRef.current;

    try {
      const res = await fetchPageRef.current(page);
      setItems((prev) => (append ? [...prev, ...res.data] : res.data));
      const more = res.meta.current_page < res.meta.last_page;
      // Skip if the filters changed while this page was loading.
      if (keyAtStart && keyAtStart === listKeyRef.current) {
        const before = append
          ? (readCache<CachedList<T>>(keyAtStart, Infinity)?.items ?? [])
          : [];
        writeCache<CachedList<T>>(keyAtStart, {
          items: [...before, ...res.data],
          page: res.meta.current_page,
          hasMore: more,
        });
      }
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
    const cached =
      enabled && listKey ? readCache<CachedList<T>>(listKey) : undefined;
    if (cached) {
      stateRef.current = { page: cached.page, hasMore: cached.hasMore, busy: false };
      setItems(cached.items);
      setHasMore(cached.hasMore);
      setLoadMoreError(null);
      setError(null);
      setLoading(false);
      return;
    }

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
  }, [enabled, listKey, ...deps]);

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
