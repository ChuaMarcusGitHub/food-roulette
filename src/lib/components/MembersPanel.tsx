import type { Group, MemberPublic } from "@/types";
import { useLocale } from "@/lib/i18n/locale-provider";

interface MembersPanelProps {
  group: Group;
  members: MemberPublic[];
  currentMemberId: string;
  isCreator: boolean;
  busy: boolean;
  onRemove: (targetId: string) => Promise<void>;
  onTransferCreator: (targetId: string) => Promise<void>;
  onClaimCreator: () => Promise<void>;
  onDeleteGroup: () => Promise<void>;
}

/** Members tab: list, remove, and delete group. */
export default function MembersPanel({
  group,
  members,
  currentMemberId,
  isCreator,
  busy,
  onRemove,
  onTransferCreator,
  onClaimCreator,
  onDeleteGroup,
}: MembersPanelProps) {
  const { t } = useLocale();

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t("group.membersTitleCount", { count: String(members.length) })}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {isCreator ? t("group.membersHelpCreator") : t("group.membersHelpOther")}
      </p>
      {!group.creator_member_id ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-xs text-amber-900 dark:text-amber-200">{t("group.noCreatorHint")}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onClaimCreator()}
            className="mt-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {t("group.claimCreator")}
          </button>
        </div>
      ) : null}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
        {members.map((m) => {
          const isYou = m.id === currentMemberId;
          const isGroupCreator = group.creator_member_id === m.id;
          const canRemove = isCreator && !isYou;
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{m.display_name}</span>
                {isYou ? <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{t("group.you")}</span> : null}
                {isGroupCreator ? (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    {t("group.creatorBadge")}
                  </span>
                ) : null}
              </div>
              {canRemove ? (
                <div className="flex flex-wrap items-center gap-2">
                  {!isGroupCreator ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => { if (window.confirm(t("group.confirmTransferCreator"))) void onTransferCreator(m.id); }}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                    >
                      {t("group.transferCreator")}
                    </button>
                  ) : null}
                  <button type="button" disabled={busy} onClick={() => { if (window.confirm(t("group.confirmRemove"))) void onRemove(m.id); }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950">
                    {t("group.remove")}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {isCreator ? (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/60 dark:bg-red-950/30">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">{t("group.deleteGroupTitle")}</h3>
          <p className="mt-1 text-xs text-red-800/90 dark:text-red-300/90">{t("group.deleteGroupHint")}</p>
          <button type="button" disabled={busy}
            onClick={() => {
              if (!window.confirm(t("group.confirmDeleteGroup"))) return;
              const typed = window.prompt(t("group.promptDelete"));
              if (typed !== "DELETE") return;
              void onDeleteGroup();
            }}
            className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50 dark:hover:bg-red-600">
            {t("group.deleteGroupCta")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
