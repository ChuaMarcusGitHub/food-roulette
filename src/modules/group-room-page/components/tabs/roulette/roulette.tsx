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
    <div
      className={room.tab === "roulette" ? "block" : "hidden"}
      aria-hidden={room.tab !== "roulette"}
    >
      <button onClick={() => postNotice({ text: "potato" })}> Hi</button>
      <SpinWheel
        {...roulette}
        locations={room.locations}
        membersCount={room.members.length}
        addTabLabel={t("group.tabs.add")}
      />
    </div>
  );
};
