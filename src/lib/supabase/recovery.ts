import type { SupabaseClient } from "@/lib/supabase/client";

interface RecoverGroupResult {
  group_id?: string;
}

/** RPC: set_group_recovery_key. */
export async function setRecoveryKey(
  supabase: SupabaseClient,
  groupId: string,
  memberId: string,
  plain: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("set_group_recovery_key", {
    p_group_id: groupId,
    p_member_id: memberId,
    p_plain: plain,
  });
  return error?.message ?? null;
}

/** RPC: recover_group_access (owner recovery). */
export async function recoverGroupAccess(
  supabase: SupabaseClient,
  inviteCode: string,
  recoveryKey: string,
): Promise<{ groupId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("recover_group_access", {
    p_invite_code: inviteCode,
    p_recovery_key: recoveryKey,
  });
  if (error) return { groupId: null, error: error.message };
  return { groupId: (data as RecoverGroupResult)?.group_id ?? null, error: null };
}

interface RecoverMemberResult {
  group_id?: string;
  member_id?: string;
}

/** RPC: recover_member_session. */
export async function recoverMemberSession(
  supabase: SupabaseClient,
  inviteCode: string,
  displayName: string,
  password: string,
  deviceId: string,
): Promise<{ groupId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("recover_member_session", {
    p_invite_code: inviteCode,
    p_display_name: displayName,
    p_password: password,
    p_device_id: deviceId,
  });
  if (error) return { groupId: null, error: error.message };
  return { groupId: (data as RecoverMemberResult)?.group_id ?? null, error: null };
}
