import { t } from "@/lib/i18n/translate";
import { PText } from "../typography";
import { LinkHome } from "../ui";

export const UnconfiguredEnv = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <PText>{t("group.configure_env")}</PText>
    <LinkHome variant={"light"} />
  </div>
);
