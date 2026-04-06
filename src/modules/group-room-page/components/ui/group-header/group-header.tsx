import { IGroup, IMemberPublic } from "@/lib/types";
import { HeaderInfo } from "./header-info";
import { LinkPaths } from "./link-paths";

interface GroupHeaderProps {
  group: IGroup;
  member: IMemberPublic;
  membersCount: number;
  onLeave: () => void;
}

/** Top of the group room: nav, title, invite, stats, collapsible recovery tips. */
export const GroupHeader = ({
  group,
  member,
  membersCount,
  onLeave,
}: GroupHeaderProps) => {
  return (
    <div className="space-y-5">
      <LinkPaths onLeave={onLeave} />
      <HeaderInfo
        groupName={group.name}
        inviteCode={group.invite_code}
        displayName={member.display_name}
        membersCount={membersCount}
      />
    </div>
  );
};
