import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}

let browserClient: SupabaseClient | null = null;

/** Singleton browser Supabase client (anon key). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (typeof window === "undefined") return createClient(url, key);
  if (!browserClient) browserClient = createClient(url, key);
  return browserClient;
}

export type { SupabaseClient };
