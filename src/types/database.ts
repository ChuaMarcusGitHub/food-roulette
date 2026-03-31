/** Row type for `groups` table. */
export interface Group {
  id: string;
  name: string | null;
  invite_code: string | null;
  created_at: string;
  creator_member_id: string | null;
  recovery_key_hash: string | null;
  join_locked: boolean;
}

/** Row type for `group_members` table. */
export interface GroupMember {
  id: string;
  group_id: string;
  display_name: string;
  device_id: string;
  created_at: string;
  member_password_hash: string | null;
  password_set: boolean;
}

/** Subset of GroupMember safe to expose in the UI (no hash). */
export interface MemberPublic {
  id: string;
  group_id: string;
  display_name: string;
  device_id: string;
  created_at: string;
  password_set: boolean;
}

/** Row type for `locations` table. */
export interface Location {
  id: string;
  group_id: string;
  url: string;
  name: string | null;
  added_by_member_id: string | null;
  created_at: string;
}

/** Row type for `roulette_runs` table. */
export interface RouletteRun {
  id: string;
  group_id: string;
  started_at: string;
  winner_location_id: string | null;
  sequence_ids: string[];
  tick_ms: number;
  status: string;
  reroll_of_run_id: string | null;
}

/** Normalised roulette run used in the client. */
export interface NormalisedRun {
  id: string;
  group_id: string;
  started_at: string;
  winner_location_id: string | null;
  sequence_ids: string[];
  tick_ms: number;
}

/** Row type for `reroll_votes` table. */
export interface RerollVote {
  roulette_run_id: string;
  member_id: string;
  created_at: string;
}

/** Tab IDs used in the group room. */
export type GroupTab = "places" | "add" | "members" | "roulette" | "settings";

