import { IUseGroupRoomReturn } from "@/lib/hooks";
import { AddPlaceForm } from "./add-place-form";
import { GroupLabel, PText } from "@/lib/components";
import { t } from "@/lib/i18n/translate";
interface IAddPlaceTabProps {
  room: IUseGroupRoomReturn;
}

export const AddPlaceTab: React.FC<IAddPlaceTabProps> = ({ room }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <GroupLabel label={t("group.add_title_google")} />
      <PText variant={"muted"} className={"mt-1"}>
        {t("group.add_hint_google_only")}
      </PText>
      <AddPlaceForm {...room} />
    </section>
  );
};
