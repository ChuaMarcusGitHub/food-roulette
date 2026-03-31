import { Link } from "react-router-dom";
import { useContext } from "react";
import type { Group, MemberPublic } from "@/types";
import { LocaleContext } from "@/lib/i18n/locale-context";
import { t } from "@translate";
import { PATHS } from "@/routes";


interface GroupHeaderProps {
  group: Group;
  member: MemberPublic;
  membersCount: number;
  onLeave: () => void;
}

/** Top of the group room: nav, title, invite, stats, collapsible recovery tips. */
export default function GroupHeader({ group, member, membersCount, onLeave }: GroupHeaderProps) {
  const { locale } = useContext(LocaleContext)!;

  const memberLine = t("group.member_line", {
    name: member.display_name,
    count: String(membersCount),
    membersWord: locale === "jp" ? "" : membersCount === 1 ? "member" : "members",
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link
            to={PATHS.HOME}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {t("common.back_home")}
          </Link>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden>
            ·
          </span>
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
          className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {t("group.leave")}
        </button>
        <div />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {group.name}
        </h1>
        <p className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-400">
          <span className="text-slate-500 dark:text-slate-500">{t("group.invite")}</span>{" "}
          <span className="font-semibold text-teal-800 dark:text-teal-400">{group.invite_code}</span>
        </p>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{memberLine}</p>
      </div>

      {/* recovery banner removed for cleaner UI */}
    </div>
  );
}
