import { PText } from "@/lib/components/typography";
import { Button } from "@/lib/components/ui";
import { getLocale, t } from "@/lib/i18n/translate";

interface IRevoteForm {
  voted: boolean;
  votes: number;
  roomMembers: number;
  majorityReached: boolean;
  onVoteReroll: () => Promise<void>;
}
export const RevoteForm: React.FC<IRevoteForm> = ({
  voted,
  roomMembers,
  majorityReached,
  votes,
  onVoteReroll,
}) => {
  const locale = getLocale();

  const majorityNeed = roomMembers > 0 ? Math.floor(roomMembers / 2) + 1 : 0;
  const voteBarPct = majorityNeed > 0 ? Math.min(100, (votes / majorityNeed) * 100) : 0;

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-600 dark:bg-slate-900/30">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <PText>
          {t("roulette.vote_line")}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{votes}</span>
          {locale === "jp" ? (
            // TODO: Fix Localization
            <> / {roomMembers}人</>
          ) : (
            <> / {roomMembers} members</>
          )}
          {majorityReached ? (
            <span className="ml-2 text-teal-700 dark:text-teal-400">{t("roulette.majority")}</span>
          ) : null}
        </PText>
        {majorityNeed > 0 ? (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {locale === "jp"
              ? // TODO: Fix Localization
                `過半数: ${majorityNeed}票`
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

      <Button
        intent={"primary"}
        size={"full"}
        disabled={voted}
        className={"mt-4 font-semibold"}
        onClick={() => onVoteReroll()}
      >
        {voted ? t("roulette.voted") : t("roulette.vote_btn")}
      </Button>
      <PText variant={"mutedXs"} className={"mt-2"}>
        {t("roulette.vote_hint")}
      </PText>
    </div>
  );
};
