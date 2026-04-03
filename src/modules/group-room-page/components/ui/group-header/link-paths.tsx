import { Link } from "react-router-dom";

import { t } from "@translate";
import { PATHS } from "@/routes";
import { LinkHome } from "@/lib/components";
interface ILinkPathsProps {
  onLeave: () => void;
}
export const LinkPaths: React.FC<ILinkPathsProps> = ({ onLeave }) => {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4 text-sm dark:border-slate-700/80">
      <div className="flex w-full items-center justify-between">
        <LinkHome />
        <Link
          to={PATHS.RECOVER}
          className="font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          {t("home.recover_link")}
        </Link>
      </div>
      <button
        type="button"
        onClick={onLeave}
        className="w-fit text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        {t("group.leave")}
      </button>
    </div>
  );
};
