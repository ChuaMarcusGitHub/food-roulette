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
  roulette: IUseRouletteReturn;
}

export const GroupTabs: React.FC<IGroupTabsProps> = ({ room, roulette }) => {
  const { tab } = room;

  if (tab === "roulette") {
    return <RouletteTab room={room} roulette={roulette} />;
  }

  const TabComponent = renderMap[tab];
  return <TabComponent room={room} />;
};
