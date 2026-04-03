import type { IUseRouletteReturn } from "@/lib/hooks/use-roulette";
import { useContext } from "react";
import { LocaleContext } from "@/lib/i18n/locale-context";
import { t } from "@translate";
import { MapPreview } from "@/lib/components";
import { SpinProgressRing } from "./spin-progress-ring";
import { placeLabel } from "./utils/place-label";
import { getDomainLabel } from "./utils/get-domain-label";
import { ILocation } from "@/lib/types";

interface SpinWheelProps extends IUseRouletteReturn {
  locations: ILocation[];
  membersCount: number;
  addTabLabel: string;
}

/** Roulette spin display, result, and voting UI. */
export const SpinWheel = ({
  phase,
  showingLoc,
  winnerLoc,
  votes,
  voted,
  majorityReached,
  spinProgress,
  spinningContext,
  handleStartRoulette,
  handleVoteReroll,
  locations,
  membersCount,
  addTabLabel,
}: SpinWheelProps) => {
  const { locale } = useContext(LocaleContext)!;

  const majorityNeed = membersCount > 0 ? Math.floor(membersCount / 2) + 1 : 0;
  const voteBarPct =
    majorityNeed > 0 ? Math.min(100, (votes.length / majorityNeed) * 100) : 0;

  // Prevent spamming: only allow starting when idle.
  // After results, the next spin should come from the majority reroll vote flow.
  const canSpin = locations.length > 0 && phase === "idle";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="relative space-y-6 px-5 py-6 sm:px-7 sm:py-8">
        {phase !== "result" ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("common.app_name")}
              </p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t("roulette.sync_hint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleStartRoulette()}
              disabled={!canSpin}
              className="shrink-0 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
            >
              {t("roulette.start")}
            </button>
          </div>
        ) : null}

        {phase === "spinning" && showingLoc && (
          <div className="relative mx-auto max-w-lg" aria-live="polite">
            <div className="relative aspect-square max-h-[min(72vw,20rem)] w-full max-w-[20rem] mx-auto">
              <SpinProgressRing progress={spinProgress} />
              <div className="absolute inset-[12%] flex flex-col items-center justify-center text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("roulette.picking")}
                </p>
                <p
                  key={showingLoc.id + String(spinningContext?.index ?? 0)}
                  className="mt-3 line-clamp-3 px-2 text-xl font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:text-2xl"
                >
                  {placeLabel(showingLoc, t("roulette.place_fallback"))}
                </p>
              </div>
            </div>

            {spinningContext ? (
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-slate-500 line-clamp-2 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                  {spinningContext.prev
                    ? placeLabel(spinningContext.prev, "…")
                    : "—"}
                </div>
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-3 font-medium text-teal-900 line-clamp-2 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100">
                  {placeLabel(showingLoc, t("roulette.place_fallback"))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-slate-500 line-clamp-2 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                  {spinningContext.next
                    ? placeLabel(spinningContext.next, "…")
                    : "—"}
                </div>
              </div>
            ) : null}

            <p className="mt-3 truncate text-center text-xs text-slate-500 dark:text-slate-400">
              {showingLoc.url}
            </p>
          </div>
        )}

        {phase === "result" && winnerLoc && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {t("roulette.result_title")}
            </h3>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
              {placeLabel(winnerLoc, t("roulette.place_fallback"))}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getDomainLabel(winnerLoc.url)}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={winnerLoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(winnerLoc.url);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <MapPreview
              url={winnerLoc.url}
              openUrlOnClick={winnerLoc.url}
              className="mt-3 h-[min(52vw,16rem)] sm:h-64"
            />

            <div className="mt-5 rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-600 dark:bg-slate-900/30">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("roulette.vote_line")}{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {votes.length}
                  </span>
                  {locale === "jp" ? (
                    <> / {membersCount}人</>
                  ) : (
                    <> / {membersCount} members</>
                  )}
                  {majorityReached ? (
                    <span className="ml-2 text-teal-700 dark:text-teal-400">
                      {t("roulette.majority")}
                    </span>
                  ) : null}
                </p>
                {majorityNeed > 0 ? (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {locale === "jp"
                      ? `過半数: ${majorityNeed}票`
                      : `Majority: ${majorityNeed} votes`}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-teal-600 transition-[width] duration-500 motion-reduce:transition-none dark:bg-teal-500"
                  style={{ width: `${voteBarPct}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => void handleVoteReroll()}
                disabled={voted}
                className="mt-4 w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {voted ? t("roulette.voted") : t("roulette.vote_btn")}
              </button>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t("roulette.vote_hint")}
              </p>
            </div>
          </div>
        )}

        {phase === "idle" && !locations.length && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-600 dark:bg-slate-800/30">
            <p className="text-3xl">🍽️</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {t("roulette.add_places_first", { tabName: addTabLabel })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
