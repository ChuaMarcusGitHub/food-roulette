import { extractGoogleMapsLatLng } from "./extract-google-lat-long";
import { isGoogleMapsUrl } from "./is-google-url";
import { placeQueryFromPath } from "./place-query-path";

const FALLBACK_LABEL = "Google Maps place";

/**
 * Best-effort place title from a Google Maps URL (for list display).
 * Short links may only yield a generic label until opened in Maps.
 */
export const derivePlaceNameFromGoogleMapsUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!isGoogleMapsUrl(trimmed)) return "";

  const fromPlace = placeQueryFromPath(trimmed);
  if (fromPlace && fromPlace.replace(/\s/g, "").length > 0) {
    return fromPlace.replace(/\+/g, " ").trim();
  }

  try {
    const u = new URL(trimmed);
    const q = u.searchParams.get("q");
    if (q) {
      const decoded = decodeURIComponent(q.replace(/\+/g, " ")).trim();
      if (decoded && !/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(decoded)) {
        return decoded;
      }
    }
    const query = u.searchParams.get("query");
    if (query) {
      const d = decodeURIComponent(query.replace(/\+/g, " ")).trim();
      if (d) return d;
    }
  } catch {
    /* ignore */
  }

  const ll = extractGoogleMapsLatLng(trimmed);
  if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
    return `Location (${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)})`;
  }

  return FALLBACK_LABEL;
}
