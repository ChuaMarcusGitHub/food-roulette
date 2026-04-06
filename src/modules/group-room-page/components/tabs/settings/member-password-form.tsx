import { useState } from "react";
import { IMemberPublic } from "@/lib/types";
import { PasswordForm, SavedPasswordPrompt } from "./form";

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
  const [editing, setEditing] = useState(false);

  const hasPassword = Boolean(member.password_set);

  const shell = embedded
    ? "p-4"
    : "mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className={shell}>
      {hasPassword && !editing ? (
        <SavedPasswordPrompt onEdit={setEditing} />
      ) : (
        <PasswordForm
          hasPassword={hasPassword}
          isEditable={editing}
          isBusy={busy}
          onSave={onSave}
          setEdit={setEditing}
        />
      )}
    </div>
  );
};
