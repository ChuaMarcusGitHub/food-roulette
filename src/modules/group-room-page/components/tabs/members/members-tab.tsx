import { IUseGroupRoomReturn } from "@/lib/hooks";
import { MembersPanel } from "./members-panel";

interface IMembersTabProps {
  room: IUseGroupRoomReturn;
}

/** Members tab: list, remove, and delete group. */
export const MembersTab = ({ room }: IMembersTabProps) => {
  return <MembersPanel {...room} />;
};
