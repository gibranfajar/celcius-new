import type Lenis from "lenis";

/**
 * The page's single Lenis instance, set by <SmoothScroll /> once it mounts.
 * Kept here (not in React state) so plain helpers such as the body scroll
 * lock can pause and resume it without a context.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}
