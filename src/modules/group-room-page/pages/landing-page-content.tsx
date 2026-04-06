import { useParams } from "react-router-dom";
import { getSupabase } from "@/lib/supabase/client";
import { useGroupRoom, useNotice, useRoulette } from "@/lib/hooks";
import {
  TabBar,
  GroupHeader,
  MemberPasswordForm,
  UnconfiguredEnv,
} from "@/lib/components";
import {
  GroupNotLoaded,
  LoadingGroup,
  MissingGroup,
  JoinGate,
} from "../components/ui";
import { GroupTabs } from "../components/tabs";

export const LandingPageContent = () => {
  const params = useParams();
  const groupId = params?.groupId as string | undefined;
  const supabase = getSupabase();
  const { postNotice } = useNotice();

  // TODO: Fix this damn hook.
  const room = useGroupRoom(groupId);
  const roulette = useRoulette(
    supabase,
    groupId,
    room.member?.id,
    room.members.length,
    room.locations,
    postNotice,
  );

  

  if (!room.configured) {
    return <UnconfiguredEnv />;
  }

  if (!groupId || typeof groupId !== "string") {
    return <MissingGroup />;
  }

  if (!room.fetched) {
    return <LoadingGroup />;
  }

  if (!room.group) {
    return <GroupNotLoaded />;
  }

  if (!room.member) {
    return (
      <JoinGate
        group={room.group}
        busy={room.busy}
        onJoin={room.handleJoinRoom}
      />
    );
  }

  if (!room.member.password_set) {
    return (
      <MemberPasswordForm
        member={room.member}
        busy={room.busy}
        onSave={room.handleSetMemberPassword}
      />
    );
  }

  return (
    <div>
      <GroupHeader
        group={room.group}
        member={room.member}
        membersCount={room.members.length}
        onLeave={room.handleLeaveGroup}
      />

      <TabBar active={room.tab} onChange={room.setTab} />
      <GroupTabs room={room} roulette={roulette} />
    </div>
  );
};
