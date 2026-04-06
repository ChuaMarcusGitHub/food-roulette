import { useEffect, useState } from "react";
import { getMapEmbedSrc } from "@/lib/utils/map-embed";
import { isGoogleMapsShortUrl } from "@/lib/utils/map-embed";

interface MapPreviewProps {
  url: string;
  className?: string;
  /** If set, clicking the preview opens this URL (overlay). */
  openUrlOnClick?: string;
}

/** Embeds a Google Maps iframe for the given URL. */
export const MapPreview = ({ url, className = "", openUrlOnClick }: MapPreviewProps) => {
  const raw = (url ?? "").trim();
  const [resolvedUrl, setResolvedUrl] = useState(raw);

  useEffect(() => {
    let cancelled = false;
    setResolvedUrl(raw);
    if (!raw || !isGoogleMapsShortUrl(raw)) return;

    (async () => {
      try {
        const r = await fetch(`/api/maps/resolve?url=${encodeURIComponent(raw)}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const data = (await r.json()) as { resolvedUrl?: string };
        if (!cancelled && data?.resolvedUrl) setResolvedUrl(data.resolvedUrl);
      } catch {
        // Keep original URL if resolve fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [raw]);

  const src = getMapEmbedSrc(resolvedUrl);
  if (!src) return null;

  const openTarget = openUrlOnClick?.trim() || resolvedUrl;
  return (
    <div className={`relative w-full ${className}`}>
      <iframe
        title="Map preview"
        src={src}
        className="h-full w-full rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        allow="fullscreen; geolocation"
      />
      {openTarget ? (
        <a
          href={openTarget}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 rounded-lg"
          aria-label="Open in Google Maps"
          title="Open in Google Maps"
        />
      ) : null}
    </div>
  );
};
