/**
 * Normalize a location URL so the same place with different tracking params
 * or trailing slashes is treated as one link.
 */
export function normalizeLocationUrlForDedup(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    const hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "") || "/";
    const params = new URLSearchParams(u.search);
    const strip = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
    ];
    strip.forEach((k) => params.delete(k));
    const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const q = new URLSearchParams(entries).toString();
    const port =
      u.port && !["80", "443"].includes(u.port) ? `:${u.port}` : "";
    return `${u.protocol}//${hostname}${port}${path}${q ? `?${q}` : ""}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}
