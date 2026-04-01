export const getDomainLabel = (rawUrl: string): string => {
  try {
    const u = new URL(rawUrl);
    return u.hostname.replace(/^www\./, "") || rawUrl;
  } catch {
    return rawUrl;
  }
};
