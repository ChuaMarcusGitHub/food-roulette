import { useParams, Link } from "react-router-dom";
import { t } from "@translate";
import { getSupabase } from "@/lib/supabase/client";
import { useGroupRoom, useRoulette } from "@/lib/hooks";
import {
  Notice,
  TabBar,
  JoinGate,
  GroupHeader,
  MemberPasswordForm,
  CreatorControls,
  PlacesList,
  AddPlaceForm,
  MembersPanel,
  SpinWheel,
} from "@/lib/components";
import { PATHS } from "@/routes";

export const GroupRoomPage = () => {
  const params = useParams();
  const groupId = params?.groupId as string | undefined;
  const supabase = getSupabase();

  const room = useGroupRoom(groupId);
  const roulette = useRoulette(
    supabase,
    groupId,
    room.member?.id,
    room.members.length,
    room.locations,
    room.showNotice,
  );

  if (!room.configured) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
        <p className="text-slate-600 dark:text-slate-400">
          {t("group.configure_env")}
        </p>
        <Link
          to={PATHS.HOME}
          className="mt-4 inline-block text-teal-700 underline dark:text-teal-400"
        >
          {t("common.back_home")}
        </Link>
      </main>
    );
  }

  if (!groupId || typeof groupId !== "string") {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
        <p className="text-slate-600 dark:text-slate-400">
          {t("group.missing_group")}
        </p>
        <Link
          to={PATHS.HOME}
          className="mt-4 inline-block text-teal-700 underline dark:text-teal-400"
        >
          {t("common.back_home")}
        </Link>
      </main>
    );
  }

  if (!room.fetched) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-slate-600 dark:text-slate-400">
        {t("group.loading_room")}
      </main>
    );
  }

  if (!room.group) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 dark:text-slate-200">
        <p className="text-slate-600 dark:text-slate-400">
          {t("group.not_loaded")}
        </p>
        <Link
          to={PATHS.HOME}
          className="mt-4 inline-block text-teal-700 underline dark:text-teal-400"
        >
          {t("common.back_home")}
        </Link>
      </main>
    );
  }

  if (!room.member) {
    return (
      <JoinGate
        group={room.group}
        notice={room.notice}
        busy={room.busy}
        onJoin={room.handleJoinRoom}
      />
    );
  }

  if (!room.member.password_set) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-24 pt-10 text-slate-900 dark:text-slate-100">
        <Notice notice={room.notice} />
        <div className="mt-6">
          <MemberPasswordForm
            member={room.member}
            busy={room.busy}
            onSave={room.handleSetMemberPassword}
            showNotice={room.showNotice}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 py-6 pb-24 text-slate-900 dark:text-slate-100">
      <GroupHeader
        group={room.group}
        member={room.member}
        membersCount={room.members.length}
        onLeave={room.handleLeaveGroup}
      />

      <Notice notice={room.notice} />

      <TabBar active={room.tab} onChange={room.setTab} />

      {room.tab === "places" && (
        <PlacesList
          locations={room.locations}
          memberNameById={room.memberNameById}
          isCreator={room.isCreator}
          busy={room.busy}
          onRemovePlace={room.handleRemovePlace}
        />
      )}

      {room.tab === "members" && (
        <MembersPanel
          group={room.group}
          members={room.members}
          currentMemberId={room.member.id}
          isCreator={room.isCreator}
          busy={room.busy}
          onRemove={room.handleRemoveMember}
          onTransferCreator={room.handleTransferCreator}
          onClaimCreator={room.handleClaimCreator}
          onDeleteGroup={room.handleDeleteGroup}
        />
      )}

      {room.tab === "add" && (
        <AddPlaceForm
          busy={room.busy}
          onAdd={room.handleAddPlace}
          showNotice={room.showNotice}
        />
      )}

      {room.tab === "settings" && (
        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {room.isCreator
              ? t("group.settings_intro_creator")
              : t("group.settings_intro_member")}
          </p>
          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900/40">
            <MemberPasswordForm
              member={room.member}
              busy={room.busy}
              onSave={room.handleSetMemberPassword}
              showNotice={room.showNotice}
              embedded
            />
            {room.isCreator ? (
              <CreatorControls
                group={room.group}
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
      )}

      <div
        className={room.tab === "roulette" ? "block" : "hidden"}
        aria-hidden={room.tab !== "roulette"}
      >
        <SpinWheel
          {...roulette}
          locations={room.locations}
          membersCount={room.members.length}
          addTabLabel={t("group.tabs.add")}
        />
      </div>
    </main>
  );
};
