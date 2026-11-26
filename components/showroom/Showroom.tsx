"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayoutMode, Showroom as ShowroomEngine } from "@/lib/showroom/engine";
import type { Look } from "@/lib/api/types";
import formatProductName from "@/lib/formatProductName";
import LookPanel, { lookTitle } from "./LookPanel";

/** Screens where page scrolling turns the carousel; smaller ones drag it. */
const SCROLL_DRIVEN_QUERY = "(min-width: 1024px)";

/** Whether the screen is wide enough for the carousel to follow the scroll. */
function useScrollDrivenScreen(): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(SCROLL_DRIVEN_QUERY);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return matches;
}

/**
 * The home page header: the looks float in a 3D carousel, switch to a grid,
 * and open the products a look wears when clicked.
 *
 * On a desktop, scrolling the page turns the carousel through the looks in
 * their sort order while the showroom stays pinned on screen; once the last
 * look is in front, the page carries on scrolling (and back up again the
 * same way). Dragging sideways turns it as well, and on a phone or tablet
 * that is the only way: the page scrolls past the showroom as usual.
 */
export default function Showroom({
  looks,
  eyebrow = "Collection",
  title = "The Showroom",
}: {
  looks: Look[];
  eyebrow?: string;
  title?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<ShowroomEngine | null>(null);
  const [layout, setLayout] = useState<LayoutMode>("showcase");
  const layoutRef = useRef<LayoutMode>(layout);
  const [selected, setSelected] = useState<number | null>(null);
  const [frontIndex, setFrontIndex] = useState(0);
  const positionRef = useRef(0);

  const count = looks.length;
  const isShowcase = layout === "showcase" && count > 1;
  const scrollDriven = useScrollDrivenScreen() && isShowcase;
  const scrollDrivenRef = useRef(scrollDriven);
  scrollDrivenRef.current = scrollDriven;

  // The scene is rebuilt only when the set of images changes.
  const images = useMemo(() => looks.map((look) => look.image_url), [looks]);
  const imagesKey = images.join("|");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || images.length === 0) return;
    let cancelled = false;
    let room: ShowroomEngine | null = null;

    import("@/lib/showroom/engine").then(({ createShowroom }) => {
      if (cancelled) return;
      room = createShowroom(stage, images, layoutRef.current, {
        onSelect: (index) => setSelected(index),
      });
      roomRef.current = room;
      room.follow(positionRef.current);
    });

    return () => {
      cancelled = true;
      room?.dispose();
      roomRef.current = null;
    };
    // Keyed on the image list's contents, not the array's identity.
  }, [imagesKey]);

  /** How far the page has scrolled through the pinned showroom, in looks. */
  const readScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    const pinned = pinnedRef.current;
    if (!wrapper || !pinned || count < 2) return 0;
    const travel = wrapper.offsetHeight - pinned.offsetHeight;
    if (travel <= 0) return 0;
    // While pinned, the stage stays put and the wrapper slides up past it.
    const scrolled =
      pinned.getBoundingClientRect().top - wrapper.getBoundingClientRect().top;
    return Math.min(Math.max(scrolled / travel, 0), 1) * (count - 1);
  }, [count]);

  // Page scroll -> carousel.
  useEffect(() => {
    if (!scrollDriven) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const position = readScroll();
      positionRef.current = position;
      setFrontIndex(Math.round(position));
      roomRef.current?.follow(position);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollDriven, readScroll]);

  // Layout state drives the animated transformation inside the scene.
  useEffect(() => {
    layoutRef.current = layout;
    roomRef.current?.setLayout(layout);
  }, [layout]);

  // While a look is open the scene steps aside and stops reacting; once it
  // closes, the carousel goes back to where the page is scrolled.
  useEffect(() => {
    roomRef.current?.setInteractive(selected === null);
    roomRef.current?.setPanelOpen(selected !== null);
    if (selected === null && scrollDrivenRef.current) {
      roomRef.current?.follow(positionRef.current);
    }
  }, [selected]);

  if (count === 0) return null;

  const isGrid = layout === "grid";
  const close = () => setSelected(null);
  const selectedLook = selected !== null ? looks[selected] : null;
  const frontLook = looks[Math.min(frontIndex, count - 1)];

  const toggleLayout = () => {
    close();
    // The grid has no scroll to turn through, so the showroom shrinks back
    // to one screen: keep the page where the showroom starts so it doesn't
    // jump down past it.
    const wrapper = wrapperRef.current;
    const pinned = pinnedRef.current;
    if (wrapper && pinned) {
      const scrolledIn =
        pinned.getBoundingClientRect().top - wrapper.getBoundingClientRect().top;
      if (scrolledIn > 0) window.scrollBy({ top: -scrolledIn });
    }
    setLayout((current) => (current === "grid" ? "showcase" : "grid"));
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full [--per-look:50svh] max-lg:!h-auto"
      style={
        isShowcase
          ? {
              height: `calc(max(100svh - var(--nav-h, 4rem), 30rem) + ${count - 1} * var(--per-look))`,
            }
          : undefined
      }
    >
      <section
        ref={pinnedRef}
        aria-label={title}
        tabIndex={0}
        className="sticky top-[var(--nav-h,4rem)] h-[calc(100svh-var(--nav-h,4rem))] min-h-[30rem] w-full overflow-hidden outline-none select-none"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 38%, #f6f3ee 0%, #e4e1dc 48%, #c6cad2 100%)",
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") roomRef.current?.step(1);
          if (event.key === "ArrowRight") roomRef.current?.step(-1);
        }}
      >
        <div
          ref={stageRef}
          className="absolute inset-0"
          role="img"
          aria-label={`Interactive 3D showroom with ${count} looks`}
        />

        {/* keyboard / screen-reader access to the same looks */}
        <ul className="sr-only">
          {looks.map((look, index) => (
            <li key={look.id}>
              <button type="button" onClick={() => setSelected(index)}>
                {lookTitle(look)}
              </button>
            </li>
          ))}
        </ul>

        <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8">
          <div>
            <p className="seccond-font text-[0.6875rem] uppercase tracking-[0.32em] text-zinc-500">
              {eyebrow}
            </p>
            <h1 className="base-font mt-1 text-2xl tracking-tight text-zinc-900 sm:text-4xl">
              {title}
            </h1>
          </div>
          <p className="seccond-font hidden max-w-[16rem] text-right text-xs leading-5 text-zinc-500 lg:block">
            {isGrid
              ? `All ${count} looks, side by side.`
              : "Scroll to turn through the looks."}
            <br />
            Click a look to shop it.
          </p>
        </header>

        {/* Which look is in front, while scrolling through them. Bottom
            left, out of the way of the looks turning past; the toggle has
            the bottom centre. */}
        {isShowcase && (
          <div className="seccond-font pointer-events-none absolute bottom-8 left-8 z-10 hidden w-[17rem] rounded-2xl bg-white/75 px-4 py-3 shadow-[0_8px_30px_rgba(20,20,30,0.10)] backdrop-blur lg:block">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-xs tabular-nums tracking-[0.2em] text-zinc-900">
                {String(frontIndex + 1).padStart(2, "0")}
                <span className="text-zinc-400"> / {String(count).padStart(2, "0")}</span>
              </p>
              <div className="h-px flex-1 bg-zinc-300">
                <div
                  className="h-px bg-zinc-900 transition-[width] duration-300"
                  style={{ width: `${((frontIndex + 1) / count) * 100}%` }}
                />
              </div>
            </div>
            <p className="base-font mt-1.5 truncate text-sm text-zinc-800">
              {formatProductName(lookTitle(frontLook))}
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-5 sm:p-8">
          <p className="seccond-font rounded-full bg-white/60 px-3 py-1 text-xs text-zinc-600 backdrop-blur lg:hidden">
            {isGrid
              ? "Tap a look to shop it."
              : "Swipe to turn · tap a look to shop it"}
          </p>
          {count > 1 && (
            <div className="seccond-font flex items-center gap-4 rounded-full bg-white/70 px-5 py-3 shadow-[0_8px_30px_rgba(20,20,30,0.12)] backdrop-blur">
              <span
                className={`text-sm transition-colors ${
                  isGrid ? "text-zinc-400" : "text-zinc-900"
                }`}
              >
                Showcase
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isGrid}
                aria-label="Switch between showcase and grid layout"
                onClick={toggleLayout}
                className="relative h-7 w-14 cursor-pointer rounded-full bg-zinc-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                <span
                  className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(${isGrid ? "1.75rem" : "0"})` }}
                />
              </button>
              <span
                className={`text-sm transition-colors ${
                  isGrid ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                Grid
              </span>
            </div>
          )}
        </div>
      </section>

      {selectedLook && (
        <LookPanel key={selectedLook.id} look={selectedLook} onClose={close} />
      )}
    </div>
  );
}
