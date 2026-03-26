/** Returns true if the URL points to Google Maps. */
export function isGoogleMapsUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return (
      host === "maps.google.com" ||
      (host === "google.com" && u.pathname.startsWith("/maps")) ||
      host === "goo.gl" ||
      host === "maps.app.goo.gl"
    );
  } catch {
    return false;
  }
}

/** True when URL is a Google Maps short redirect link. */
export function isGoogleMapsShortUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return host === "maps.app.goo.gl" || host === "goo.gl";
  } catch {
    return false;
  }
}

interface LatLng {
  lat: number;
  lng: number;
}

/** Extract lat/lng from a Google Maps URL. */
export function extractGoogleMapsLatLng(urlString: string): LatLng | null {
  const s = urlString.trim();

  const placeCoord = s.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (placeCoord) {
    return { lat: parseFloat(placeCoord[1]), lng: parseFloat(placeCoord[2]) };
  }

  const atCoord = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,|$)/);
  if (atCoord) {
    return { lat: parseFloat(atCoord[1]), lng: parseFloat(atCoord[2]) };
  }

  const qCenter = s.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (qCenter) {
    return { lat: parseFloat(qCenter[1]), lng: parseFloat(qCenter[2]) };
  }

  return null;
}

/** Decode /place/... slug from a Google Maps path. */
export function placeQueryFromPath(urlString: string): string | null {
  try {
    const u = new URL(urlString);
    const m = u.pathname.match(/\/place\/([^/]+)/);
    if (!m) return null;
    return decodeURIComponent(m[1].replace(/\+/g, " "));
  } catch {
    return null;
  }
}

const FALLBACK_LABEL = "Google Maps place";

/**
 * Best-effort place title from a Google Maps URL (for list display).
 * Short links may only yield a generic label until opened in Maps.
 */
export function derivePlaceNameFromGoogleMapsUrl(url: string): string {
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

function embedFromLatLng(lat: number, lng: number, zoom = 18): string {
  const z = Math.min(21, Math.max(1, zoom));
  return `https://www.google.com/maps?q=${lat},${lng}&z=${z}&hl=en&output=embed`;
}

/** Build a Google Maps embed URL from any location URL. */
export function getMapEmbedSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (isGoogleMapsUrl(trimmed)) {
    if (trimmed.includes("output=embed") && /google\.com\/maps\//i.test(trimmed)) {
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
