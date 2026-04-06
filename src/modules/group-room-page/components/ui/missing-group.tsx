import { LinkHome } from "@/lib/components/ui";
import { t } from "@/lib/i18n/translate";
import { PText } from "@/lib/components/typography";

export const MissingGroup = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <PText>{t("group.missing_group")}</PText>
    <LinkHome variant={"light"} />
  </div>
);
