import { useState, type SubmitEvent } from "react";
import { t } from "@translate";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { useNotice } from "@/lib/hooks";
import { IMemberPublic } from "@/lib/types";
import { Button, Input, Text } from "@/lib/components";

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

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
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
              <Text variant={"body2"} className={"font-medium text-slate-800"}>
                {t("group.member_password_saved_short")}
              </Text>
              <Text variant={"muted"} className={"mt-0.5"}>
                {t("group.member_password_remember_stored")}
              </Text>
            </div>
          </div>
          <Button intent={"ghost"} className={"shrink-0"} onClick={() => setEditing(true)}>
            {t("group.member_password_change_cta")}
          </Button>
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

      <Text className="mt-1">
        {hasPassword
          ? t("group.member_password_change_hint")
          : t("group.member_password_hint")}
      </Text>
      {!hasPassword ? (
        <Text variant={"warn"} className="mt-2">
          {t("group.member_password_remember_warn")}
        </Text>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <Input type={"password"} autoComplete={"new-password"} placeholder={t("group.member_password_placeholder")} value={pw} onChange={(e) => setPw(e.target.value)} disabled={busy} />
        <Input type={"password"} autoComplete={"new-password"} placeholder={t("group.member_password_confirm")} value={pw2} onChange={(e) => setPw2(e.target.value)} disabled={busy} />
        <div className="flex flex-wrap gap-2">
          <Button type={"submit"} intent={"submit"} disabled={busy}>
            {hasPassword
              ? t("group.member_password_update_save")
              : t("group.member_password_save")}
          </Button>
          {hasPassword && editing ? (
            <Button intent={"ghost"} disabled={busy} onClick={handleCancel}>
              {t("group.member_password_cancel")}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
};
