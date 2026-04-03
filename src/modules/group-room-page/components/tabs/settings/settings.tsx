import { MemberPasswordForm } from "./member-password-form";
import { CreatorControls } from "./creator-controls";
import { t } from "@/lib/i18n/translate";
import { IUseGroupRoomReturn } from "@/lib/hooks";

interface ISettingsTabProps {
  room: IUseGroupRoomReturn;
}
export const SettingsTab: React.FC<ISettingsTabProps> = ({ room }) => {
  return (
    <section className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {room.isCreator
          ? t("group.settings_intro_creator")
          : t("group.settings_intro_member")}
      </p>
      <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900/40">
        <MemberPasswordForm
          member={room.member!}
          busy={room.busy}
          onSave={room.handleSetMemberPassword}
          embedded
        />
        {room.isCreator ? (
          <CreatorControls
            group={room.group!}
            inviteDraft={room.inviteDraft}
            setInviteDraft={room.setInviteDraft}
            busy={room.busy}
            onSaveCode={room.handleSaveInviteCode}
            onRandomize={room.handleRandomInviteCode}
            onToggleLock={room.handleToggleJoinLocked}
            embedded
          />
        ) : null}
      </div>
    </section>
  );
};
