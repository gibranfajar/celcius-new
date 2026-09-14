import { ProductSize } from "@/lib/api/types";

// Apparel sizes in their conventional order. Anything not in this list (e.g.
// numeric shoe/waist sizes) falls back to ascending numeric order below.
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"];

export function sortProductSizes<T extends Pick<ProductSize, "size">>(
  sizes: T[],
): T[] {
  return [...sizes].sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a.size.toUpperCase());
    const bIndex = SIZE_ORDER.indexOf(b.size.toUpperCase());

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    const aNum = Number(a.size);
    const bNum = Number(b.size);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

    return a.size.localeCompare(b.size);
  });
}
