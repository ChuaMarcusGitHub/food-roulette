import { SpinWheel } from "@/lib/components";
import {
  IUseGroupRoomReturn,
  IUseRouletteReturn,
} from "@/lib/hooks";
import { t } from "@/lib/i18n/translate";

interface IRouletteTabProps {
  room: IUseGroupRoomReturn;
  roulette: IUseRouletteReturn;
}
export const RouletteTab: React.FC<IRouletteTabProps> = ({
  room,
  roulette,
}) => {

  return (
    <span data-testid={"roulette-tab"}>
      <SpinWheel
        {...roulette}
        locations={room.locations}
        membersCount={room.members.length}
        addTabLabel={t("group.tabs.add")}
      />
    </span>
  );
};
