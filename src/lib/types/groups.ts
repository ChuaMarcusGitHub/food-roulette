/** Row type for `groups` table. */
export interface IGroup {
  id: string;
  name: string | null;
  invite_code: string | null;
  created_at: string;
  creator_member_id: string | null;
  recovery_key_hash: string | null;
  join_locked: boolean;
}

/** Tab IDs used in the group room. */
export type GroupTab = "places" | "add" | "members" | "roulette" | "settings";
