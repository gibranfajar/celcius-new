"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/lenis";

/** How many open overlays want the page locked; it unlocks at zero. */
let lockCount = 0;
let savedStyles: {
  htmlOverflow: string;
  bodyPaddingRight: string;
} | null = null;

function lock() {
  lockCount += 1;
  if (lockCount > 1) return;

  const { documentElement: html, body } = document;
  // The scrollbar disappears when locked; pad by its width so the page
  // doesn't jump sideways on desktop.
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  savedStyles = {
    htmlOverflow: html.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
  };

  // Only the html element (the page's scroller). Hiding body's overflow as
  // well would turn body into a scroll container of its own, and every
  // sticky element (the navbar, the showroom) would let go and jump.
  html.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  // Lenis scrolls the page from script, which overflow: hidden doesn't
  // stop, so pause it too. Scrollable panels inside the overlay still work.
  getLenis()?.stop();
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyles) return;

  const { documentElement: html, body } = document;
  html.style.overflow = savedStyles.htmlOverflow;
  body.style.paddingRight = savedStyles.bodyPaddingRight;
  savedStyles = null;
  getLenis()?.start();
}

/** Whether an overlay is holding the page still right now. */
export function isBodyScrollLocked() {
  return lockCount > 0;
}

/**
 * Stops the page behind a modal, drawer or sheet from scrolling while
 * `locked` is true. Several overlays can lock at once: the page scrolls
 * again only when the last one closes.
 */
export function useBodyScrollLock(locked: boolean = true) {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
}
