import { useParams } from "react-router-dom";

import { t } from "@translate";
import { Button, PText } from "@/lib/components";

import { ILocation } from "@/lib/types";
import { RouletteResult, WheelSpinning } from "./components";
import { IUseGroupRoomReturn, useNotice, useRoulette } from "@/lib/hooks";
import { getSupabase } from "@/lib/supabase";

interface SpinWheelProps {
  room: IUseGroupRoomReturn;
  locations: ILocation[];
  membersCount: number;
  addTabLabel: string;
}

/** Roulette spin display, result, and voting UI. */
export const SpinWheel = ({ room, locations, membersCount, addTabLabel }: SpinWheelProps) => {
  const params = useParams();
  const groupId = params?.groupId as string | undefined;

  const supabase = getSupabase();
  const { postNotice } = useNotice();

  const {
    majorityReached,
    spinProgress,
    spinningContext,
    phase,
    winnerLoc,
    showingLoc,
    votes,
    voted,
    handleVoteReroll,
    handleStartRoulette,
  } = useRoulette(
    supabase,
    groupId,
    room.member?.id,
    room.members.length,
    room.locations,
    postNotice
  );

  // Prevent spamming: only allow starting when idle.
  // After results, the next spin should come from the majority reroll vote flow.
  const canSpin = locations.length > 0 && phase === "idle";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="relative space-y-6 px-5 py-6 sm:px-7 sm:py-8">
        {phase !== "result" ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <PText variant={"labelXs"}>{t("common.app_name")}</PText>
              <PText className="mt-1 max-w-md leading-relaxed">{t("roulette.sync_hint")}</PText>
            </div>
            <Button
              intent={"primary"}
              disabled={!canSpin}
              className={"shrink-0 px-5 font-semibold"}
              onClick={() => handleStartRoulette()}
            >
              {t("roulette.start")}
            </Button>
          </div>
        ) : null}

        {phase === "spinning" && showingLoc && (
          <WheelSpinning
            location={showingLoc}
            spinProgress={spinProgress}
            spinningContext={spinningContext}
          />
        )}

        {phase === "result" && winnerLoc && (
          <RouletteResult
            winLocation={winnerLoc}
            roomMembers={membersCount}
            votes={votes.length}
            voted={voted}
            majorityReached={majorityReached}
            onVoteReroll={handleVoteReroll}
          />
        )}

        {phase === "idle" && !locations.length && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-600 dark:bg-slate-800/30">
            <p className="text-3xl">🍽️</p>
            <PText className={"mt-3"}>
              {t("roulette.add_places_first", { tabName: addTabLabel })}
            </PText>
          </div>
        )}
      </div>
    </div>
  );
};
