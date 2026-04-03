import { t } from "@translate";
import { GroupTab } from "../types";

interface TabDef {
  id: GroupTab;
  labelKey: string;
}

const TABS: TabDef[] = [
  { id: "roulette", labelKey: "group.tabs.roulette" },
  { id: "places", labelKey: "group.tabs.places" },
  { id: "add", labelKey: "group.tabs.add" },
  { id: "members", labelKey: "group.tabs.members" },
  { id: "settings", labelKey: "group.tabs.settings" },
];

interface TabBarProps {
  active: GroupTab;
  onChange: (tab: GroupTab) => void;
}

/** Tab bar for the group room. */
export const TabBar = ({ active, onChange }: TabBarProps) => {
  return (
    <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100/80 p-1 sm:gap-1 dark:border-slate-700 dark:bg-slate-800/80">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`min-w-[4.25rem] shrink-0 flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition sm:min-w-0 sm:px-3 sm:text-sm ${
            active === tab.id
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
};
