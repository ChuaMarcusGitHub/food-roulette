import { IUseGroupRoomReturn } from "@/lib/hooks";
import { PlacesList } from "./places-list";

interface IPlacesTabProps {
  room: IUseGroupRoomReturn;
}
export const PlacesTab = ({ room }: IPlacesTabProps) => {
  return <PlacesList {...room} />;
};
