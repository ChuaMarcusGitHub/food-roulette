import { t } from "@/lib/i18n/translate";
import { Text } from "@/lib/components";

export const LoadingGroup = () => (
  <div className="mx-auto max-w-lg px-4 py-16 text-center">
    <Text>{t("group.loading_room")}</Text>
  </div>
);
