import type { SupabaseClient } from "@/lib/supabase/client";
import { INVITE_CODE_LENGTH } from "@/constants";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate a random 6-char invite code. */
export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

interface UniqueOpts {
  excludeGroupId?: string;
}

/** Keep generating until we find a code not in use. */
export async function generateUniqueInviteCode(
  supabase: SupabaseClient,
  opts: UniqueOpts = {},
): Promise<string> {
  const { excludeGroupId } = opts;
  for (let attempt = 0; attempt < 36; attempt++) {
    const code = generateInviteCode();
    const { data } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (!data) return code;
    if (excludeGroupId && data.id === excludeGroupId) return code;
  }
  throw new Error("Could not generate a unique invite code. Try again.");
}
