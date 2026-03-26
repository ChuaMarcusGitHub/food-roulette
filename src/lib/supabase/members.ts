import type { SupabaseClient } from "@/lib/supabase/client";
import type { MemberPublic } from "@/types";

const MEMBER_SELECT = "id, display_name, created_at, group_id, device_id, password_set";

/** Fetch all members of a group, ordered by join date. */
export async function fetchMembers(
  supabase: SupabaseClient,
  groupId: string,
): Promise<{ data: MemberPublic[]; error: string | null }> {
  const { data, error } = await supabase
    .from("group_members")
    .select("id, display_name, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  return { data: (data ?? []) as MemberPublic[], error: error?.message ?? null };
}

/** Fetch the current device's member row. */
export async function fetchSelf(
  supabase: SupabaseClient,
  groupId: string,
  deviceId: string,
): Promise<{ data: MemberPublic | null; error: string | null }> {
  const { data, error } = await supabase
    .from("group_members")
    .select(MEMBER_SELECT)
    .eq("group_id", groupId)
    .eq("device_id", deviceId)
    .maybeSingle();
  return { data: data as MemberPublic | null, error: error?.message ?? null };
}

interface JoinResult {
  group_id?: string;
}

/** RPC: join_group_by_group_id. */
export async function joinGroupById(
  supabase: SupabaseClient,
  groupId: string,
  displayName: string,
  deviceId: string,
): Promise<{ data: JoinResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("join_group_by_group_id", {
    p_group_id: groupId,
    p_display_name: displayName,
    p_device_id: deviceId,
  });
  return { data: data as JoinResult | null, error: error?.message ?? null };
}

/** RPC: join_group (by invite code). */
export async function joinGroupByCode(
  supabase: SupabaseClient,
  inviteCode: string,
  displayName: string,
  deviceId: string,
): Promise<{ data: JoinResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("join_group", {
    p_invite_code: inviteCode,
    p_display_name: displayName,
    p_device_id: deviceId,
  });
  return { data: data as JoinResult | null, error: error?.message ?? null };
}

/** RPC: remove_group_member. */
export async function removeMember(
  supabase: SupabaseClient,
  groupId: string,
  actorMemberId: string,
  targetMemberId: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("remove_group_member", {
    p_group_id: groupId,
    p_actor_member_id: actorMemberId,
    p_target_member_id: targetMemberId,
  });
  return error?.message ?? null;
}

/** RPC: set_member_password. */
export async function setMemberPassword(
  supabase: SupabaseClient,
  groupId: string,
  deviceId: string,
  plain: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("set_member_password", {
    p_group_id: groupId,
    p_device_id: deviceId,
    p_plain: plain,
  });
  return error?.message ?? null;
}

/** RPC: leave_group (remove current member; if creator leaves, transfer creator role). */
export async function leaveGroup(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("leave_group", {
    p_group_id: groupId,
    p_member_id: memberId,
  });
  return error?.message ?? null;
}
