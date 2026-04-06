/** Decode /place/... slug from a Google Maps path. */
export const placeQueryFromPath = (urlString: string): string | null => {
  try {
    const u = new URL(urlString);
    const m = u.pathname.match(/\/place\/([^/]+)/);
    if (!m) return null;
    return decodeURIComponent(m[1].replace(/\+/g, " "));
  } catch {
    return null;
  }
};
