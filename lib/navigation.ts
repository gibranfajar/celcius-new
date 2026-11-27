/** Identifies a page for scroll memory: path plus query, no #hash. */
export function pageKey(url: { pathname: string; search: string }) {
  return url.pathname + url.search;
}

/**
 * The in-site URL a click is about to open in this tab, or null when the
 * click won't navigate here (new tab, download, other site, same page).
 */
export function internalNavigationTarget(event: MouseEvent): URL | null {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (pageKey(url) === pageKey(window.location)) return null;
  return url;
}
