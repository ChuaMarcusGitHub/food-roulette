import { t } from "@translate";
import { LinkHome, LinkRecover } from "@/lib/components";
interface ILinkPathsProps {
  onLeave: () => void;
}
export const LinkPaths: React.FC<ILinkPathsProps> = ({ onLeave }) => {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4 text-sm dark:border-slate-700/80">
      <div className="flex w-full items-center justify-between">
        <LinkHome />
        <LinkRecover className={"font-medium hover:underline"} />
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
