import { MapPreview } from "@/lib/components/map-preview";
import { PText } from "@/lib/components/typography";
import { Button } from "@/lib/components/ui";
import { t } from "@/lib/i18n/translate";
import { getDomainLabel } from "@/modules/group-room-page/utils";

interface IResultLocationProps {
  url: string;
}
export const ResultLocation: React.FC<IResultLocationProps> = ({ url }) => {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <PText variant={"mutedXs"}>{getDomainLabel(url)}</PText>

        <div className="flex flex-wrap gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {t("action.open")}
          </a>
          <Button intent={"ghost"} size={"sm"} onClick={() => navigator.clipboard?.writeText(url)}>
            {t("action.copy")}
          </Button>
        </div>
      </div>
      <MapPreview url={url} openUrlOnClick={url} className="mt-3 h-[min(52vw,16rem)] sm:h-64" />
    </>
  );
};
