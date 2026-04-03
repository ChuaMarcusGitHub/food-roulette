import { LinkHome } from "@/lib/components";
import { t } from "@/lib/i18n/translate";
import { Text } from "@/lib/components/typography";

export const GroupNotLoaded = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <Text className="text-slate-600 dark:text-slate-400">
      {t("group.not_loaded")}
    </Text>
    <LinkHome variant={"light"} />
  </div>
);
