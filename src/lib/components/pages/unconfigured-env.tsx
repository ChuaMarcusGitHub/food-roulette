import { t } from "@/lib/i18n/translate";
import { Text } from "../typography";
import { LinkHome } from "../ui";

export const UnconfiguredEnv = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <Text>{t("group.configure_env")}</Text>
    <LinkHome variant={"light"} />
  </div>
);
