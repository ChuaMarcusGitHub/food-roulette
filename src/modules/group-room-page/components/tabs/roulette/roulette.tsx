import { SpinWheel } from "@/lib/components";
import {
  IUseGroupRoomReturn,
  IUseRouletteReturn,
  useNotice,
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
  const { postNotice } = useNotice();

  return (
    <span data-testid={"roulette-tab"}>
      <button onClick={() => postNotice({ text: "potato" })}> Hi</button>
      <SpinWheel
        {...roulette}
        locations={room.locations}
        membersCount={room.members.length}
        addTabLabel={t("group.tabs.add")}
      />
    </span>
  );
};
