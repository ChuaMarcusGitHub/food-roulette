import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-only Supabase client with service role (bypasses RLS). */
export function createServiceClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
