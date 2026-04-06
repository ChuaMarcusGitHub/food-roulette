import { Button, Text } from "@/lib/components";
import { t } from "@/lib/i18n/translate";

interface ISavedPasswordPromptProps {
  onEdit: (flag: boolean) => void;
}
export const SavedPasswordPrompt: React.FC<ISavedPasswordPromptProps> = ({
  onEdit,
}) => {
  return (
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
      <Button
        intent={"ghost"}
        className={"shrink-0"}
        onClick={() => onEdit(true)}
      >
        {t("group.member_password_change_cta")}
      </Button>
    </div>
  );
};
