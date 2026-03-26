-- Lunch/Dinner Picker — baseline schema (new project)
--
-- EASIEST: apply everything at once to Supabase SQL Editor:
--   supabase/apply_complete_database.sql
--
-- Or run migrations in order:
--   supabase/migrations/20250325120000_members_roulette.sql
--   supabase/migrations/20250325200000_creator_purge_cleanup.sql
--   supabase/migrations/20250325210000_creator_member_admin.sql
--   supabase/migrations/20250325220000_recovery_key.sql
--   supabase/migrations/20250325240000_member_password_join_lock.sql
--   supabase/migrations/20250326200000_pgcrypto_search_path.sql  (if DB predates search_path fix)
--   supabase/migrations/20250326210000_group_members_password_set_if_missing.sql
--   supabase/migrations/20250326220000_ensure_set_member_password_and_deps.sql
--   supabase/migrations/20250327010000_creator_claim_transfer.sql

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text,
  invite_code text unique,
  created_at timestamp with time zone default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups (id) on delete cascade,
  url text,
  created_at timestamp with time zone default now()
);

create index if not exists locations_group_id_idx on locations (group_id);

-- MVP: public anon access (no auth). Tighten policies before production.
alter table groups enable row level security;
alter table locations enable row level security;

create policy "groups_select" on groups for select using (true);
create policy "groups_insert" on groups for insert with check (true);

create policy "locations_select" on locations for select using (true);
create policy "locations_insert" on locations for insert with check (true);
create policy "locations_delete" on locations for delete using (true);
