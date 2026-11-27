"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getLenis } from "@/lib/lenis";
import { pageKey } from "@/lib/navigation";

const STORAGE_KEY = "celcius:scroll-positions";
const MAX_PAGES = 50;
/** Give up chasing the saved spot after this long (slow API, list ended). */
const RESTORE_TIMEOUT_MS = 8000;
/** Frames the page must sit at the saved spot before we let go. */
const SETTLE_FRAMES = 15;

/*
 * Every page loads its products in the browser after it appears, so when
 * the visitor goes Back the list is still empty and the browser's own
 * scroll restore lands at the top. Instead, remember where each page was
 * left and, on Back/Forward (or a reload), keep scrolling toward that spot
 * while the content loads in. Scrolling to the bottom of a part-loaded list
 * also wakes its infinite-scroll sentinel, so deep spots are reached too.
 */

let positions: Record<string, number> = {};
/** While true, scroll events don't overwrite the saved spot. */
let frozen = false;
/** Where a Back/Forward wants to land, once the new page has mounted. */
let pendingRestore: number | null = null;
/** The URL whose page React has most recently put on screen. */
let renderedKey: string | null = null;
let cancelRestore: (() => void) | null = null;
let persistTimer: number | undefined;

function persist() {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    const keys = Object.keys(positions);
    if (keys.length > MAX_PAGES) {
      for (const key of keys.slice(0, keys.length - MAX_PAGES)) {
        delete positions[key];
      }
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // Private mode or a full quota: memory for this tab still works.
    }
  }, 150);
}

function scrollToY(y: number) {
  const lenis = getLenis();
  if (lenis) {
    // Lenis caps scrolling at the page height it last measured, which may
    // still be the previous page's: measure the new page first.
    lenis.resize();
    lenis.scrollTo(y, { immediate: true, force: true });
  }
  else window.scrollTo(0, y);
}

function restore(y: number) {
  cancelRestore?.();
  frozen = true;

  const startedAt = performance.now();
  let settled = 0;
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of USER_INPUT) window.removeEventListener(type, stop);
    cancelRestore = null;
    frozen = false;
  };

  const step = () => {
    if (Math.abs(window.scrollY - y) > 1) {
      scrollToY(y);
      settled = 0;
    } else {
      settled += 1;
    }
    if (
      settled >= SETTLE_FRAMES ||
      performance.now() - startedAt > RESTORE_TIMEOUT_MS
    ) {
      stop();
      return;
    }
    frame = requestAnimationFrame(step);
  };

  // The visitor taking over the scroll ends the chase.
  for (const type of USER_INPUT) {
    window.addEventListener(type, stop, { passive: true });
  }
  cancelRestore = stop;
  step();
}

const USER_INPUT = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

export default function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      positions = {};
    }
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const onScroll = () => {
      if (frozen) return;
      positions[pageKey(window.location)] = window.scrollY;
      persist();
    };

    // Back/Forward. Next.js may render the page for the new URL inside its
    // own popstate listener, before or after this one runs: if it already
    // has, chase the spot now; otherwise wait for the route effect below.
    // Either way, freeze saving so the page being swapped out can't
    // overwrite the spot we're about to return to.
    const onPopState = () => {
      cancelRestore?.();
      const key = pageKey(window.location);
      const target = positions[key] ?? 0;
      if (renderedKey === key) {
        restore(target);
      } else {
        frozen = true;
        pendingRestore = target;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);

    // A reload or a Back into the site from elsewhere.
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const saved = positions[pageKey(window.location)];
    if (
      saved &&
      (entry?.type === "reload" || entry?.type === "back_forward")
    ) {
      restore(saved);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      window.history.scrollRestoration = previous;
      cancelRestore?.();
    };
  }, []);

  // The new page has mounted: chase the saved spot if this was Back/Forward.
  // A normal link click is left alone; Next.js already starts it at the top.
  useEffect(() => {
    renderedKey = pageKey(window.location);
    if (pendingRestore === null) return;
    const y = pendingRestore;
    pendingRestore = null;
    restore(y);
  }, [pathname, searchParams]);

  return null;
}
