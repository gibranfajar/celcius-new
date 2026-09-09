export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Matches the breakpoints already used across the app (`md:` = 768px,
 * `lg:` = 1024px) so banner `display` filtering lines up with the same
 * breakpoints the responsive layout switches on.
 */
export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
