import { LinkHome } from "@/lib/components/ui";
import { t } from "@/lib/i18n/translate";
import { Text } from "@/lib/components/typography";

export const MissingGroup = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <Text className={"text-slate-600 dark:text-slate-400"}>
      {t("group.missing_group")}
    </Text>
    <LinkHome />
  </div>
);
