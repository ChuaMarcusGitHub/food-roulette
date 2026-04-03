import { t } from "@/lib/i18n/translate";
import { PATHS } from "@/routes";
import { Link } from "react-router-dom";

export const LinkHome = () => (
  <Link
    to={PATHS.HOME}
    className="mt-4 inline-block text-teal-700 underline dark:text-teal-400"
  >
    {t("common.back_home")}
  </Link>
);
