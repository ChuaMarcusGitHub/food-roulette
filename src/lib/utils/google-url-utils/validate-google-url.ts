import { isGoogleMapsUrl } from "./is-google-url";

// returns a translation key string or null
export const validateGoogleMapsUrl = (raw: string): string | null => {
  const u = raw.trim();
  if (!u) return "group.err_add_url";
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return "group.err_url_scheme";
  } catch {
    return "group.err_url_invalid";
  }
  if (!isGoogleMapsUrl(u)) return "group.err_google_maps_only";
  return null;
};