import { ILocation } from "@/lib/types";
import { PText } from "../../typography";
import { SpinProgressRing } from "../spin-progress-ring";
import { t } from "@/lib/i18n/translate";
import { ISpinningContext } from "@/lib/hooks";
import { placeLabel } from "../utils/place-label";

interface IWheelSpinningProps {
  spinProgress: number;
  location: ILocation;
  spinningContext: ISpinningContext | null;
}
export const WheelSpinning: React.FC<IWheelSpinningProps> = ({
  spinProgress,
  spinningContext,
  location,
}) => {
  return (
    <div className="relative mx-auto max-w-lg" aria-live="polite">
      <div className="relative aspect-square max-h-[min(72vw,20rem)] w-full max-w-[20rem] mx-auto">
        <SpinProgressRing progress={spinProgress} />
        <div className="absolute inset-[12%] flex flex-col items-center justify-center text-center">
          <PText variant={"labelXs"}>{t("roulette.picking")}</PText>

          <p
            key={location.id + String(spinningContext?.index ?? 0)}
            className="mt-3 line-clamp-3 px-2 text-xl font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:text-2xl"
          >
            {placeLabel(location, t("roulette.place_fallback"))}
          </p>
        </div>
      </div>
      {spinningContext ? (
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-slate-500 line-clamp-2 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            {spinningContext.prev ? placeLabel(spinningContext.prev, "…") : "—"}
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-3 font-medium text-teal-900 line-clamp-2 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100">
            {placeLabel(location, t("roulette.place_fallback"))}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-slate-500 line-clamp-2 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            {spinningContext.next ? placeLabel(spinningContext.next, "…") : "—"}
          </div>
        </div>
      ) : null}

      <PText variant={"mutedXs"} className={"mt-3 truncate text-center "}>
        {location.url}
      </PText>
    </div>
  );
};
