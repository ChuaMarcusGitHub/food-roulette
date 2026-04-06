import { t } from "@/lib/i18n/translate";
import { PText } from "@/lib/components";

export const LoadingGroup = () => (
  <div className="mx-auto max-w-lg px-4 py-16 text-center">
    <PText>{t("group.loading_room")}</PText>
  </div>
);
