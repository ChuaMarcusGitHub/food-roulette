import { useState, type FormEvent } from "react";
import { t } from "@translate";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { useNotice } from "@/lib/hooks";
import { IMemberPublic } from "@/lib/types";
import { Text } from "@/lib/components";

interface MemberPasswordFormProps {
  member: IMemberPublic;
  busy: boolean;
  onSave: (pw: string) => Promise<void>;
  /** When true, no outer card border (parent provides the shell). */
  embedded?: boolean;
}

/** Per-member recovery password: prompt only until set; then compact + change. */
export const MemberPasswordForm = ({
  member,
  busy,
  onSave,
  embedded = false,
}: MemberPasswordFormProps) => {
  const { postNotice } = useNotice();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [editing, setEditing] = useState(false);

  const hasPassword = Boolean(member.password_set);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const a = pw.trim();
    const b = pw2.trim();
    if (a.length < MIN_PASSWORD_LENGTH) {
      postNotice({
        text: t("group.err_member_password_short"),
        variant: "error",
      });
      return;
    }
    if (a !== b) {
      postNotice({
        text: t("group.member_password_mismatch"),
        variant: "error",
      });
      return;
    }
    void onSave(a).then(() => {
      setPw("");
      setPw2("");
      setEditing(false);
    });
  }

  function handleCancel() {
    setPw("");
    setPw2("");
    setEditing(false);
  }

  const shell = embedded
    ? "p-4"
    : "mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900";

  if (hasPassword && !editing) {
    return (
      <div className={shell}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-200"
              aria-hidden
            >
              ✓
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {t("group.member_password_saved_short")}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t("group.member_password_remember_stored")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {t("group.member_password_change_cta")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <Text variant={"labelSm"}>
        {hasPassword
          ? t("group.member_password_change_title")
          : t("group.member_password_title")}
      </Text>

      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {hasPassword
          ? t("group.member_password_change_hint")
          : t("group.member_password_hint")}
      </p>
      {!hasPassword ? (
        <p className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          {t("group.member_password_remember_warn")}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="password"
          autoComplete="new-password"
          placeholder={t("group.member_password_placeholder")}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          disabled={busy}
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder={t("group.member_password_confirm")}
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          disabled={busy}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-teal-800 dark:hover:bg-teal-700"
          >
            {hasPassword
              ? t("group.member_password_update_save")
              : t("group.member_password_save")}
          </button>
          {hasPassword && editing ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {t("group.member_password_cancel")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};
