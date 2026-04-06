/** True when URL is a Google Maps short redirect link. */
export const isGoogleMapsShortUrl = (url: string): boolean => {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return host === "maps.app.goo.gl" || host === "goo.gl";
  } catch {
    return false;
  }
};
