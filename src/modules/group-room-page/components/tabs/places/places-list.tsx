import { t } from "@translate";
import { Button, GroupLabel, Input, MapPreview, PText } from "@/lib/components";
import { useMemo, useState } from "react";
import { ILocation } from "@/lib/types";
import { getDomainLabel } from "@/modules/group-room-page/utils/get-domain-label";

interface IPlacesListProps {
  locations: ILocation[];
  memberNameById: Record<string, string>;
  isCreator: boolean;
  busy: boolean;
  handleRemovePlace: (locationId: string) => Promise<void>;
}
export const PlacesList = ({
  locations,
  memberNameById,
  isCreator,
  busy,
  handleRemovePlace,
}: IPlacesListProps) => {
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
      const by = loc.added_by_member_id
        ? (memberNameById[loc.added_by_member_id] ?? "")
        : "";
      return (
        name.includes(q) || url.includes(q) || by.toLowerCase().includes(q)
      );
    });
  }, [locations, memberNameById, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);

  const handlePrev = () => { setPage((p) => Math.max(1, p - 1)); setExpandedId(null); };
  const handleNext = () => { setPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); };

  return (
    <section className="space-y-4">
      <GroupLabel
        label={t("group.places_title_count", {
          count: String(locations.length),
        })}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input type={"text"} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); setExpandedId(null); }} placeholder={"Search places…"} className={"sm:max-w-sm"} />
        <PText variant={"mutedXs"}>
          {filtered.length === locations.length ? null : (
            <>
              {filtered.length} / {locations.length}
            </>
          )}
        </PText>
      </div>

      {locations.length === 0 ? (
        <PText variant={"mutedXs"}>
          {t("group.places_empty_tab", { tabName: t("group.tabs.add") })}
        </PText>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {shown.map((loc) => {
              const addedBy = loc.added_by_member_id
                ? (memberNameById[loc.added_by_member_id] ??
                  t("common.someone"))
                : t("common.someone");
              const isExpanded = expandedId === loc.id;
              const label = loc.name?.trim() || t("roulette.place_fallback");
              const domain = getDomainLabel(loc.url);
              return (
                <li key={loc.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === loc.id ? null : loc.id,
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <PText variant={"body2"} className="truncate">
                        {label}
                      </PText>
                      <PText
                        variant={"mutedXs"}
                        className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1"
                      >
                        <span className="truncate">{domain}</span>
                        <span
                          aria-hidden
                          className="text-slate-300 dark:text-slate-600"
                        >
                          ·
                        </span>
                        <span className="truncate">
                          {t("group.add_by")} {addedBy}
                        </span>
                      </PText>
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
                      <Button
                        intent={"ghost"}
                        size={"sm"}
                        onClick={() => navigator.clipboard?.writeText(loc.url)}
                      >
                        Copy
                      </Button>
                      {isCreator ? (
                        <Button
                          intent={"dangerGhost"}
                          size={"sm"}
                          disabled={busy}
                          onClick={() => {
                            if (!window.confirm(t("group.confirm_remove_place"))) return;
                            void handleRemovePlace(loc.id);
                          }}
                        >
                          {t("group.remove_place")}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-3 space-y-3">
                      <MapPreview
                        url={loc.url}
                        openUrlOnClick={loc.url}
                        className="h-[220px]"
                      />
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
          <Button
            intent={"ghost"}
            disabled={safePage <= 1}
            onClick={handlePrev}
          >
            Prev
          </Button>

          <PText>
            Page
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {safePage}
            </span>
            / {totalPages}
          </PText>

          <Button
            intent={"ghost"}
            disabled={safePage >= totalPages}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
};
