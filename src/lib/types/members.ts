/** Row type for `group_members` table. */
export interface IGroupMember {
  id: string;
  group_id: string;
  display_name: string;
  device_id: string;
  created_at: string;
  member_password_hash: string | null;
  password_set: boolean;
}

/** Subset of GroupMember safe to expose in the UI (no hash). */
export interface IMemberPublic {
  id: string;
  group_id: string;
  display_name: string;
  device_id: string;
  created_at: string;
  password_set: boolean;
}
