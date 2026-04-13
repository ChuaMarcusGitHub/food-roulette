import { IUseGroupRoomReturn, IUseRouletteReturn } from "@/lib/hooks";
import { AddPlaceTab } from "./add-place/";
import { RouletteTab } from "./roulette";
import { SettingsTab } from "./settings";
import { MembersTab } from "./members";
import { PlacesTab } from "./places";

const renderMap = {
  places: PlacesTab,
  add: AddPlaceTab,
  members: MembersTab,
  settings: SettingsTab,
  roulette: RouletteTab,
};

interface IGroupTabsProps {
  room: IUseGroupRoomReturn;
}

export const GroupTabs: React.FC<IGroupTabsProps> = ({ room }) => {
  const { tab } = room;

  const TabComponent = renderMap[tab];
  return <TabComponent room={room} />;
};
