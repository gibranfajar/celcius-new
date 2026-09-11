// The membership API returns bare filenames for tier/promo images (no
// protocol/host), so the base URL has to be applied on our side.
const TIER_IMAGE_BASE_URL = "https://amscorp.id/card/";
const PROMO_IMAGE_BASE_URL = "https://web.amscorp.id:3060/imagestorage/promo/";

export function tierImageUrl(filename: string): string {
  return `${TIER_IMAGE_BASE_URL}${encodeURIComponent(filename)}`;
}

export function promoImageUrl(filename: string): string {
  return `${PROMO_IMAGE_BASE_URL}${encodeURIComponent(filename)}`;
}
