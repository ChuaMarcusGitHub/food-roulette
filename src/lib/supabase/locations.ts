import type { SupabaseClient } from "@/lib/supabase/client";
import type { Location } from "@/types";

/** Fetch all locations for a group, ordered by creation. */
export async function fetchLocations(
  supabase: SupabaseClient,
  groupId: string,
): Promise<{ data: Location[]; error: string | null }> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  return { data: (data ?? []) as Location[], error: error?.message ?? null };
}

/** Insert a new location. */
export async function addLocation(
  supabase: SupabaseClient,
  groupId: string,
  name: string,
  url: string,
  memberId: string,
): Promise<string | null> {
  const { error } = await supabase.from("locations").insert({
    group_id: groupId,
    name,
    url,
    added_by_member_id: memberId,
  });
  return error?.message ?? null;
}

/**
 * Delete a location row by id.
 * Uses `.select()` so we can tell "0 rows deleted" (e.g. missing DELETE RLS policy)
 * from a successful delete — PostgREST often returns no error when RLS blocks delete.
 */
export async function deleteLocation(
  supabase: SupabaseClient,
  locationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("locations")
    .delete()
    .eq("id", locationId)
    .select("id");

  if (error) return error.message;
  if (!data?.length) {
    return "no_rows_deleted";
  }
  return null;
}
