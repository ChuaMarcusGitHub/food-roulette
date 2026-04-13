import { t } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils/cn";
import { PATHS } from "@/routes";
import { Link } from "react-router-dom";

type StyleVariant = "mute" | "light";
const classVariant: Record<StyleVariant, string> = {
  light: "text-teal-700 dark:text-teal-400",
  mute: "",
};

interface ILinkRecoverProps {
  className?: string;
  variant?: StyleVariant;
}
export const LinkRecover: React.FC<ILinkRecoverProps> = ({
  className,
  variant,
}) => {
  const variantStyle: StyleVariant = variant ?? "light";
  return (
    <Link
      to={PATHS.RECOVER}
      className={cn([classVariant[variantStyle], className])}
    >
      {t("home.recover_link")}
    </Link>
  );
};
