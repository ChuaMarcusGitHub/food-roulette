import { Text } from "@/lib/components/typography";
import { LocaleContext } from "@/lib/i18n/locale-context";
import { t } from "@/lib/i18n/translate";
import { useContext } from "react";

interface IHeaderInfoProps {
  groupName: string | null;
  inviteCode: string | null;
  displayName: string;
  membersCount: number;
}

export const HeaderInfo: React.FC<IHeaderInfoProps> = ({
  groupName = "NONE",
  inviteCode,
  displayName,
  membersCount,
}) => {
  const { locale } = useContext(LocaleContext)!;
  const memberLine = t("group.member_line", {
    name: displayName,
    count: String(membersCount),
    membersWord:
      locale === "jp" ? "" : membersCount === 1 ? "member" : "members",
  });

  return (
    <div>
      <Text variant={"h1"}>{groupName}</Text>
      <Text variant={"body1"} className={"mt-2 font-mono"}>
        <span className="text-slate-500 dark:text-slate-500">
          {t("group.invite")}
        </span>
        <span className="font-semibold text-teal-800 dark:text-teal-400">
          {inviteCode}
        </span>
      </Text>
      <Text variant={"body1"} className={"my-1.5"}>
        {memberLine}
      </Text>
    </div>
  );
};
