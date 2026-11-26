/** A place to show on a map: coordinates, a ready-made link, or both. */
export interface MapPlace {
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsUrl?: string | null;
}

function hasCoordinates(place: MapPlace): boolean {
  return place.latitude != null && place.longitude != null;
}

/**
 * A Google Maps link that opens directions to the place (the app on a
 * phone), from wherever the shopper is.
 */
export function directionsUrl(place: MapPlace): string {
  if (place.mapsUrl) return place.mapsUrl;

  const destination = hasCoordinates(place)
    ? `${place.latitude},${place.longitude}`
    : [place.name, place.address].filter(Boolean).join(", ");

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** A Google Maps embed of the place, which needs no API key. */
export function embedUrl(place: MapPlace): string {
  const query = hasCoordinates(place)
    ? `${place.latitude},${place.longitude}`
    : [place.name, place.address].filter(Boolean).join(", ");

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}
