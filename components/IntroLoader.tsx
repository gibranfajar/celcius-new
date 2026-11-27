"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/public/images/logo.png";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { INTRO_SEEN_KEY } from "@/lib/intro";

/** The intro stays at least this long, so it reads as a moment, not a flicker. */
const MIN_MS = 900;
/** And never longer than this, however slow the images are. */
const MAX_MS = 3500;

/**
 * A full-screen loader on the first visit of a session: the logo and a
 * running line until the page has loaded, then the curtain lifts.
 */
export default function IntroLoader() {
  const [phase, setPhase] = useState<"showing" | "leaving" | "done">(
    "showing",
  );
  const [locked, setLocked] = useState(false);
  useBodyScrollLock(locked);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "seen") {
      setPhase("done");
      return;
    }
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Without storage the intro simply plays on every load.
    }
    setLocked(true);

    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_MS));
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) =>
            window.addEventListener("load", resolve, { once: true }),
          );
    const cap = new Promise((resolve) => setTimeout(resolve, MAX_MS));

    let cancelled = false;
    Promise.race([Promise.all([minDelay, pageLoaded]), cap]).then(() => {
      if (cancelled) return;
      setPhase("leaving");
      setLocked(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className="intro-loader"
      data-leaving={phase === "leaving" || undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && phase === "leaving") {
          setPhase("done");
        }
      }}
    >
      <div className="intro-loader__inner">
        <Image
          src={Logo}
          alt=""
          priority
          className="intro-loader__logo h-7 w-auto md:h-8"
        />
        <div className="intro-loader__track">
          <span className="intro-loader__bar" />
        </div>
      </div>
    </div>
  );
}
