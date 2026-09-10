import { Paginated } from "./types";

// For small "preview everything" spots (nav mega-menu, sidebar) where the
// UI has no scroll/click affordance of its own to page through results -
// pulls every page of a paginated endpoint and flattens it into one array,
// automatically, with no user action involved.
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<Paginated<T>>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  while (true) {
    const res = await fetchPage(page);
    all.push(...res.data);

    if (res.meta.current_page >= res.meta.last_page) break;
    page += 1;
  }

  return all;
}
