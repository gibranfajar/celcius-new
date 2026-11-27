"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { internalNavigationTarget } from "@/lib/navigation";

/**
 * A thin bar along the top of the window while a link is opening: it
 * creeps toward the end as the next page loads, then fills and fades out
 * once that page is on screen.
 */
export default function NavigationProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let giveUp: gsap.core.Tween | null = null;

    const onClick = (event: MouseEvent) => {
      if (!internalNavigationTarget(event)) return;
      loadingRef.current = true;
      gsap.killTweensOf(bar);
      gsap.set(bar, { opacity: 1, scaleX: 0 });
      gsap.to(bar, { scaleX: 0.9, duration: 6, ease: "power4.out" });
      // In case the visit never finishes (a cancelled navigation).
      giveUp?.kill();
      giveUp = gsap.delayedCall(10, () => {
        if (!loadingRef.current) return;
        loadingRef.current = false;
        gsap.to(bar, { opacity: 0, duration: 0.3 });
      });
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      giveUp?.kill();
      gsap.killTweensOf(bar);
    };
  }, []);

  // The new page is on screen: finish the bar.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !loadingRef.current) return;
    loadingRef.current = false;
    gsap.killTweensOf(bar);
    gsap
      .timeline()
      .to(bar, { scaleX: 1, duration: 0.25, ease: "power2.out" })
      .to(bar, { opacity: 0, duration: 0.3 }, "+=0.1");
  }, [pathname, searchParams]);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-neutral-900 opacity-0"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
