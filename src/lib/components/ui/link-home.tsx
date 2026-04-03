import { t } from "@/lib/i18n/translate";
import { PATHS } from "@/routes";
import { Link } from "react-router-dom";

type StyleVariant = "mute" | "light";
const classVariant: Record<StyleVariant, string> = {
  mute: "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
  light: "mt-4 inline-block text-teal-700 underline dark:text-teal-400",
};
interface ILinkHomeProps {
  variant?: StyleVariant;
}
export const LinkHome: React.FC<ILinkHomeProps> = ({ variant = "mute" }) => (
  <Link to={PATHS.HOME} className={classVariant[variant]}>
    {t("common.back_home")}
  </Link>
);
