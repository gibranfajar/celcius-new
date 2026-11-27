"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { setLenis } from "@/lib/lenis";
import { isBodyScrollLocked } from "@/lib/hooks/useBodyScrollLock";

/**
 * Smooth wheel scrolling for the whole page (Lenis). Touch devices keep
 * their native scrolling; users who prefer reduced motion get plain scroll.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // Driven by GSAP's ticker below instead of a loop of its own.
      autoRaf: false,
      lerp: 0.1,
      // In-page #anchor links glide instead of jumping.
      anchors: true,
      // Clicking a link mid-glide doesn't carry the glide onto the new page.
      stopInertiaOnNavigate: true,
      // Scrollable panels (cart, filters, modals, sheets) keep scrolling
      // themselves instead of the page.
      allowNestedScroll: true,
      // A component that already handled the wheel (e.g. the showroom
      // turning its carousel on a sideways swipe) keeps it.
      virtualScroll: ({ event }) => !event.defaultPrevented,
    });

    // One clock for scrolling and animation: each frame Lenis moves the page
    // first (it is put at the front of the ticker), then whatever follows
    // the scroll (the showroom carousel) and draws, in that same frame.
    // Two separate loops would leave them a frame apart now and then, which
    // reads as judder.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick, false, true);
    gsap.ticker.lagSmoothing(0);

    setLenis(lenis);
    // An overlay may have opened before Lenis was ready.
    if (isBodyScrollLocked()) lenis.stop();
    return () => {
      gsap.ticker.remove(tick);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
