/** Returns true if the URL points to Google Maps. */
export const isGoogleMapsUrl = (url: string): boolean => {
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
};
