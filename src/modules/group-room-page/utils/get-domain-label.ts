export const getDomainLabel = (rawUrl: string): string => {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./, "");
    return host || rawUrl;
  } catch {
    return rawUrl;
  }
};
