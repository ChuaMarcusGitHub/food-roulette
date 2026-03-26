import type { Location } from "@/types";
import { useLocale } from "@/lib/i18n/context";
import MapPreview from "@/lib/components/MapPreview";
import { useMemo, useState } from "react";

interface PlacesListProps {
  locations: Location[];
  memberNameById: Record<string, string>;
  isCreator: boolean;
  busy: boolean;
  onRemovePlace: (locationId: string) => Promise<void>;
}

function getDomainLabel(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./, "");
    return host || rawUrl;
  } catch {
    return rawUrl;
  }
}

/** All places tab content. */
export default function PlacesList({
  locations,
  memberNameById,
  isCreator,
  busy,
  onRemovePlace,
}: PlacesListProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      const name = loc.name?.toLowerCase() ?? "";
      const url = loc.url?.toLowerCase() ?? "";
      const by = loc.added_by_member_id ? (memberNameById[loc.added_by_member_id] ?? "") : "";
      return name.includes(q) || url.includes(q) || by.toLowerCase().includes(q);
    });
  }, [locations, memberNameById, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t("group.placesTitleCount", { count: String(locations.length) })}
      </h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            setExpandedId(null);
          }}
          placeholder="Search places…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 sm:max-w-sm"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length === locations.length ? null : (
            <span>{filtered.length} / {locations.length}</span>
          )}
        </p>
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("group.placesEmptyTab", { tabName: t("group.tabs.add") })}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {shown.map((loc) => {
              const addedBy = loc.added_by_member_id ? memberNameById[loc.added_by_member_id] ?? t("common.someone") : t("common.someone");
              const isExpanded = expandedId === loc.id;
              const label = loc.name?.trim() || t("roulette.placeFallback");
              const domain = getDomainLabel(loc.url);
              return (
                <li key={loc.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId((prev) => (prev === loc.id ? null : loc.id))}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">{domain}</span>
                        <span aria-hidden className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="truncate">{t("group.addBy")} {addedBy}</span>
                      </p>
                    </button>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <a
                        href={loc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard?.writeText(loc.url);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        Copy
                      </button>
                      {isCreator ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (!window.confirm(t("group.confirmRemovePlace"))) return;
                            void onRemovePlace(loc.id);
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950"
                        >
                          {t("group.removePlace")}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-3 space-y-3">
                      <MapPreview url={loc.url} openUrlOnClick={loc.url} className="h-[220px]" />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {locations.length > 0 && filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              setExpandedId(null);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Prev
          </button>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-slate-100">{safePage}</span> / {totalPages}
          </p>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              setExpandedId(null);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
