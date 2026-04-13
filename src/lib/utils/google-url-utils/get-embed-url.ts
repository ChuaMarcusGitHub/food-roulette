import { extractGoogleMapsLatLng } from "./extract-google-lat-long";
import { isGoogleMapsUrl } from "./is-google-url";
import { placeQueryFromPath } from "./place-query-path";

const embedFromLatLng = (lat: number, lng: number, zoom = 18): string => {
  const z = Math.min(21, Math.max(1, zoom));
  return `https://www.google.com/maps?q=${lat},${lng}&z=${z}&hl=en&output=embed`;
};

/** Build a Google Maps embed URL from any location URL. */
export function getMapEmbedSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (isGoogleMapsUrl(trimmed)) {
    if (
      trimmed.includes("output=embed") &&
      /google\.com\/maps\//i.test(trimmed)
    ) {
      return trimmed;
    }

    const ll = extractGoogleMapsLatLng(trimmed);
    if (
      ll &&
      Number.isFinite(ll.lat) &&
      Number.isFinite(ll.lng) &&
      Math.abs(ll.lat) <= 90 &&
      Math.abs(ll.lng) <= 180
    ) {
      const zoomMatch = trimmed.match(/,(\d{1,2})z(?:\b|\/)/);
      const z = zoomMatch ? parseInt(zoomMatch[1], 10) : 18;
      return embedFromLatLng(ll.lat, ll.lng, z);
    }

    const placeName = placeQueryFromPath(trimmed);
    if (placeName) {
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&hl=en&output=embed`;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&hl=en&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&hl=en&output=embed`;
}
