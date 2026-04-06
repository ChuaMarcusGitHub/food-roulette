import { LinkHome } from "@/lib/components";
import { t } from "@/lib/i18n/translate";
import { PText } from "@/lib/components/typography";

export const GroupNotLoaded = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <PText>{t("group.not_loaded")}</PText>
    <LinkHome variant={"light"} />
  </div>
);
