
import { IUseGroupRoomReturn } from "@/lib/hooks";
import { AddPlaceForm } from "./add-place-form";
interface IAddPlaceTabProps {
  room: IUseGroupRoomReturn;
}

export const AddPlaceTab: React.FC<IAddPlaceTabProps> = ({ room }) => {
  return <AddPlaceForm {...room} />;
};
