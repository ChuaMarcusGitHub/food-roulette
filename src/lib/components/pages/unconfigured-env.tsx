import { t } from "@/lib/i18n/translate";
import { LinkHome } from "../ui";

export const UnconfiguredEnv = () => (
  <div className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
    <p className="text-slate-600 dark:text-slate-400">
      {t("group.configure_env")}
    </p>
    <LinkHome />
  </div>
);
