import { PText } from "@/lib/components/typography";
import { ILocation } from "@/lib/types";
import { ResultLocation } from "./result-location";
import { t } from "@/lib/i18n/translate";
import { RevoteForm } from "./revote-form";

interface IRouletteResultProps {
  winLocation: ILocation;
  roomMembers: number;
  votes: number;
  voted: boolean;
  majorityReached: boolean;
  onVoteReroll: () => Promise<void>;
}
export const RouletteResult: React.FC<IRouletteResultProps> = ({
  winLocation,
  roomMembers,
  votes,
  voted,
  majorityReached,
  onVoteReroll,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40">
      <PText variant={"body1"}>{t("roulette.result_title")}</PText>
      <PText variant={"h3"} className="mt-2">
        {winLocation.name ?? t("roulette.place_fallback")}
      </PText>
      <ResultLocation url={winLocation.url} />
      <RevoteForm
        voted={voted}
        votes={votes}
        roomMembers={roomMembers}
        majorityReached={majorityReached}
        onVoteReroll={onVoteReroll}
      />
    </div>
  );
};
