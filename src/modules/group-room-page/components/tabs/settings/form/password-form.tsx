import { useState, type SubmitEvent } from "react";
import { t } from "@translate";
import { Button, Input, PText } from "@/lib/components";
import { useNotice } from "@/lib/hooks";
import { validatePassword } from "@/modules/group-room-page/utils";

interface IPasswordFormProps {
  isBusy: boolean;
  isEditable: boolean;
  hasPassword: boolean;
  setEdit: (flag: boolean) => void;
  onSave: (pw: string) => Promise<void>;
}
export const PasswordForm: React.FC<IPasswordFormProps> = ({
  isEditable,
  isBusy,
  hasPassword,
  setEdit,
  onSave,
}) => {
  const { postNotice } = useNotice();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const promptKeys: Record<string, string> = {
    title: hasPassword
      ? "member_password_change_title"
      : "member_password_title",
    hint: hasPassword ? "member_password_change_hint" : "member_password_hint",
  };

  const resetStates = () => {
    setPassword("");
    setConfirmPassword("");
    setEdit(false);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validatePassword({
      password: password,
      confirmPassword: confirmPassword,
    });

    if (error) {
      postNotice({
        text: t(`${error}`),
        variant: "error",
      });
      return;
    }

    // No errors proceed to save password
    await onSave(password.trim());
    resetStates();
  };

  return (
    <>
      <PText variant={"labelXs"}>{t(`group.${promptKeys.title}`)}</PText>
      <PText className="mt-1">{t(`group.${promptKeys.hint}`)}</PText>
      {!hasPassword && (
        <PText variant={"warn"} className="mt-2">
          {t("group.member_password_remember_warn")}
        </PText>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <Input
          type={"password"}
          autoComplete={"new-password"}
          placeholder={t("group.member_password_placeholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isBusy}
        />
        <Input
          type={"password"}
          autoComplete={"new-password"}
          placeholder={t("group.member_password_confirm")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isBusy}
        />
        <div className="flex flex-wrap gap-2">
          <Button type={"submit"} intent={"submit"} disabled={isBusy}>
            {hasPassword
              ? t("group.member_password_update_save")
              : t("group.member_password_save")}
          </Button>
          {hasPassword && isEditable ? (
            <Button
              intent={"ghost"}
              disabled={isBusy}
              onClick={() => resetStates()}
            >
              {t("group.member_password_cancel")}
            </Button>
          ) : null}
        </div>
      </form>
    </>
  );
};
