"use client";

import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/client";

/*
 * In-memory cache of what pages fetched, so going Back to a page shows its
 * content on the very first render instead of a skeleton. That is what lets
 * the scroll position be put back at once (components/ScrollRestoration).
 * It lives only as long as the tab, and entries go stale after a while so
 * prices and stock don't drift far from the server.
 */

const MAX_AGE_MS = 5 * 60 * 1000;

const store = new Map<string, { data: unknown; at: number }>();

export function readCache<T>(key: string, maxAge = MAX_AGE_MS): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.at > maxAge) {
    store.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function writeCache<T>(key: string, data: T) {
  store.set(key, { data, at: Date.now() });
}

type CachedData<T> = {
  key: string | null;
  data: T | undefined;
  loading: boolean;
  error: string | null;
};

/**
 * Loads `load()` once per `key` and remembers the result: a later mount with
 * the same key (e.g. after Back) gets the data straight away, no loading
 * state. Pass `null` as the key to wait (e.g. until a route param exists).
 */
export function useCachedData<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = useState<CachedData<T>>(() => {
    const data = key === null ? undefined : readCache<T>(key);
    return { key, data, loading: key !== null && data === undefined, error: null };
  });
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (key === null) return;

    const cached = readCache<T>(key);
    if (cached !== undefined) {
      setState((prev) =>
        prev.key === key && prev.data === cached
          ? prev
          : { key, data: cached, loading: false, error: null },
      );
      return;
    }

    let cancelled = false;
    setState({ key, data: undefined, loading: true, error: null });
    loadRef.current().then(
      (data) => {
        writeCache(key, data);
        if (!cancelled) setState({ key, data, loading: false, error: null });
      },
      (err) => {
        if (!cancelled) {
          setState({ key, data: undefined, loading: false, error: getErrorMessage(err) });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
