import { IGroup, IMemberPublic } from "@/lib/types";
import { t } from "@translate";

interface IMembersPanelProps {
  group: IGroup | null;
  members: IMemberPublic[];
  member: IMemberPublic | null;
  isCreator: boolean;
  busy: boolean;
  handleRemoveMember: (targetId: string) => Promise<void>;
  handleTransferCreator: (targetId: string) => Promise<void>;
  handleClaimCreator: () => Promise<void>;
  handleDeleteGroup: () => Promise<void>;
}

/** Members tab: list, remove, and delete group. */
export const MembersPanel = ({
  group,
  members,
  member,
  isCreator,
  busy,
  handleRemoveMember,
  handleTransferCreator,
  handleClaimCreator,
  handleDeleteGroup,
}: IMembersPanelProps) => {
  const currentMemberId = member?.id;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t("group.members_title_count", { count: String(members.length) })}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {isCreator ? t("group.members_help_creator") : t("group.members_help_other")}
      </p>
      {!group?.creator_member_id ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-xs text-amber-900 dark:text-amber-200">{t("group.no_creator_hint")}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleClaimCreator()}
            className="mt-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {t("group.claim_creator")}
          </button>
        </div>
      ) : null}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
        {members.map((m) => {
          const isYou = m.id === currentMemberId;
          const isGroupCreator = group?.creator_member_id === m.id;
          const canRemove = isCreator && !isYou;
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{m.display_name}</span>
                {isYou ? <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{t("group.you")}</span> : null}
                {isGroupCreator ? (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    {t("group.creator_badge")}
                  </span>
                ) : null}
              </div>
              {canRemove ? (
                <div className="flex flex-wrap items-center gap-2">
                  {!isGroupCreator ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => { if (window.confirm(t("group.confirm_transfer_creator"))) void handleTransferCreator(m.id); }}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                    >
                      {t("group.transfer_creator")}
                    </button>
                  ) : null}
                  <button type="button" disabled={busy} onClick={() => { if (window.confirm(t("group.confirm_remove"))) void handleRemoveMember(m.id); }}
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
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">{t("group.delete_group_title")}</h3>
          <p className="mt-1 text-xs text-red-800/90 dark:text-red-300/90">{t("group.delete_group_hint")}</p>
          <button type="button" disabled={busy}
            onClick={() => {
              if (!window.confirm(t("group.confirm_delete_group"))) return;
              const typed = window.prompt(t("group.prompt_delete"));
              if (typed !== "DELETE") return;
              void handleDeleteGroup();
            }}
            className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50 dark:hover:bg-red-600">
            {t("group.delete_group_cta")}
          </button>
        </div>
      ) : null}
    </section>
  );
};
