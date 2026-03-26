import type { SupabaseClient } from "@/lib/supabase/client";
import type { Group } from "@/types";

/** Fetch a single group by id. */
export async function fetchGroup(
  supabase: SupabaseClient,
  groupId: string,
): Promise<{ data: Group | null; error: string | null }> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();
  return { data: data as Group | null, error: error?.message ?? null };
}

/** Create a new group row and return it. */
export async function createGroup(
  supabase: SupabaseClient,
  name: string,
  inviteCode: string,
): Promise<{ data: Group | null; error: string | null }> {
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();
  return { data: data as Group | null, error: error?.message ?? null };
}

/** Set the creator member id on a group. */
export async function setGroupCreator(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
): Promise<string | null> {
  const { error } = await supabase
    .from("groups")
    .update({ creator_member_id: memberId })
    .eq("id", groupId);
  return error?.message ?? null;
}

interface ChangeInviteResult {
  invite_code?: string;
}

/** RPC: change_group_invite_code. */
export async function changeInviteCode(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
  newCode: string,
): Promise<{ data: ChangeInviteResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("change_group_invite_code", {
    p_group_id: groupId,
    p_member_id: memberId,
    p_new_code: newCode,
  });
  return { data: data as ChangeInviteResult | null, error: error?.message ?? null };
}

/** RPC: delete_group_by_creator. */
export async function deleteGroup(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("delete_group_by_creator", {
    p_group_id: groupId,
    p_member_id: memberId,
  });
  return error?.message ?? null;
}

interface JoinLockResult {
  join_locked?: boolean;
}

/** RPC: set_group_join_locked. */
export async function setJoinLocked(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
  locked: boolean,
): Promise<{ data: JoinLockResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("set_group_join_locked", {
    p_group_id: groupId,
    p_member_id: memberId,
    p_locked: locked,
  });
  return { data: data as JoinLockResult | null, error: error?.message ?? null };
}

interface CreatorResult {
  creator_member_id?: string;
}

/** RPC: transfer_group_creator. */
export async function transferCreator(
  supabase: SupabaseClient,
  groupId: string,
  actorMemberId: string,
  targetMemberId: string,
): Promise<{ data: CreatorResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("transfer_group_creator", {
    p_group_id: groupId,
    p_actor_member_id: actorMemberId,
    p_target_member_id: targetMemberId,
  });
  return { data: data as CreatorResult | null, error: error?.message ?? null };
}

/** RPC: claim_group_creator. */
export async function claimCreator(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
): Promise<{ data: CreatorResult | null; error: string | null }> {
  const { data, error } = await supabase.rpc("claim_group_creator", {
    p_group_id: groupId,
    p_member_id: memberId,
  });
  return { data: data as CreatorResult | null, error: error?.message ?? null };
}
