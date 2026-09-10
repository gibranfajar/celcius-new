import { Banner } from "@/lib/api/types";

/**
 * Maps a banner's `display` field to the Tailwind breakpoints already used
 * across the app (`md:` = 768px, `lg:` = 1024px) so the right banner group is
 * shown per device purely through CSS media queries - no JS resize/viewport
 * detection, so it works during SSR and reacts to resizing.
 */
export function getBannerDisplayClass(display: Banner["display"]): string {
  switch (display) {
    case "mobile":
      return "block md:hidden";
    case "tablet":
      return "hidden md:block lg:hidden";
    case "desktop":
      return "hidden lg:block";
    default:
      // No device set on the banner - show it everywhere.
      return "block";
  }
}

export const BANNER_DISPLAY_TYPES: Array<Banner["display"]> = [
  "mobile",
  "tablet",
  "desktop",
];

export function bannersForDisplay(
  banners: Banner[],
  display: Banner["display"],
): Banner[] {
  return banners.filter((b) => b.display === display || b.display === null);
}
