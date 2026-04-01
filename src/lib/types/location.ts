/** Row type for `locations` table. */
export interface Location {
  id: string;
  group_id: string;
  url: string;
  name: string | null;
  added_by_member_id: string | null;
  created_at: string;
}
