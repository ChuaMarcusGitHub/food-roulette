import { type FormEvent } from "react";
import { t } from "@translate";
import { IGroup } from "@/lib/types";
import { Button, Text } from "@/lib/components";

interface CreatorControlsProps {
  group: IGroup;
  inviteDraft: string;
  setInviteDraft: (s: string) => void;
  busy: boolean;
  onSaveCode: (code: string) => Promise<void>;
  onRandomize: () => Promise<void>;
  onToggleLock: () => Promise<void>;
  /** Inside a shared settings card — no extra outer border. */
  embedded?: boolean;
}

/** Creator-only controls: invite code management and join lock. */
export const CreatorControls = ({
  group,
  inviteDraft,
  setInviteDraft,
  busy,
  onSaveCode,
  onRandomize,
  onToggleLock,
  embedded = false,
}: CreatorControlsProps) => {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = inviteDraft.trim().toUpperCase();
    if (code.length === 6) void onSaveCode(code);
  }

  const wrap = embedded
    ? "p-4"
    : "mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className={wrap}>
      <Text variant={"labelSm"}>{t("group.creator_invite")}</Text>
      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <input
          type="text"
          maxLength={6}
          value={inviteDraft}
          onChange={(e) =>
            setInviteDraft(
              e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            )
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono tracking-widest sm:max-w-[10rem] dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          disabled={busy}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" intent="primary" size="md" disabled={busy}>
            {t("group.save_code")}
          </Button>
          <Button intent="ghost" size="md" disabled={busy} onClick={() => void onRandomize()}>
            {t("group.randomize")}
          </Button>
        </div>
      </form>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-950"
          checked={Boolean(group.join_locked)}
          onChange={() => void onToggleLock()}
          disabled={busy}
        />
        <span>
          <span className="font-medium">{t("group.join_locked_label")}</span>
          <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
            {t("group.join_locked_help")}
          </span>
        </span>
      </label>
    </div>
  );
};
