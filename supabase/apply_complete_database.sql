-- =============================================================================
-- FoodRoulette / Lunch/Dinner Picker — APPLY COMPLETE DATABASE (Supabase)
-- =============================================================================
-- Run once in: Supabase Dashboard → SQL Editor → paste all → Run
--
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS
-- where possible. Does NOT drop your data tables.
--
-- After success: wait ~30–60s for API schema cache, then use the app.
-- =============================================================================

-- --- Extensions (Supabase keeps pgcrypto in schema "extensions") -------------
create extension if not exists pgcrypto with schema extensions;

-- =============================================================================
-- 1) Core tables (baseline)
-- =============================================================================
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text,
  invite_code text unique,
  created_at timestamptz default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups (id) on delete cascade,
  url text,
  created_at timestamptz default now()
);

create index if not exists locations_group_id_idx on locations (group_id);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  display_name text not null,
  device_id text not null,
  created_at timestamptz default now(),
  unique (group_id, device_id)
);

create index if not exists group_members_group_id_idx on group_members (group_id);

alter table groups add column if not exists creator_member_id uuid references group_members (id) on delete set null;
alter table groups add column if not exists recovery_key_hash text;
alter table groups add column if not exists join_locked boolean not null default false;

alter table locations add column if not exists name text;
alter table locations add column if not exists added_by_member_id uuid references group_members (id) on delete set null;

alter table group_members add column if not exists member_password_hash text;

do $pwd_set$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'group_members' and column_name = 'password_set'
  ) then
    alter table group_members
      add column password_set boolean
      generated always as (member_password_hash is not null) stored;
  end if;
end
$pwd_set$;

-- --- roulette_runs -----------------------------------------------------------
create table if not exists roulette_runs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  started_at timestamptz not null default now(),
  winner_location_id uuid references locations (id) on delete set null,
  sequence_ids uuid[] not null,
  tick_ms int not null default 110,
  status text not null default 'spinning',
  reroll_of_run_id uuid references roulette_runs (id) on delete set null
);

create unique index if not exists roulette_runs_one_reroll_child
  on roulette_runs (reroll_of_run_id)
  where reroll_of_run_id is not null;

create index if not exists roulette_runs_group_started_idx
  on roulette_runs (group_id, started_at desc);

create table if not exists reroll_votes (
  roulette_run_id uuid not null references roulette_runs (id) on delete cascade,
  member_id uuid not null references group_members (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (roulette_run_id, member_id)
);

-- =============================================================================
-- 2) Row Level Security + policies (MVP: open anon)
-- =============================================================================
alter table groups enable row level security;
alter table locations enable row level security;
alter table group_members enable row level security;
alter table roulette_runs enable row level security;
alter table reroll_votes enable row level security;

drop policy if exists "groups_select" on groups;
create policy "groups_select" on groups for select using (true);

drop policy if exists "groups_insert" on groups;
create policy "groups_insert" on groups for insert with check (true);

drop policy if exists "groups_update" on groups;
create policy "groups_update" on groups for update using (true) with check (true);

drop policy if exists "locations_select" on locations;
create policy "locations_select" on locations for select using (true);

drop policy if exists "locations_insert" on locations;
create policy "locations_insert" on locations for insert with check (true);

drop policy if exists "locations_update" on locations;
create policy "locations_update" on locations for update using (true) with check (true);

drop policy if exists "locations_delete" on locations;
create policy "locations_delete" on locations for delete using (true);

drop policy if exists "group_members_all" on group_members;
create policy "group_members_all" on group_members for all using (true) with check (true);

drop policy if exists "roulette_runs_select" on roulette_runs;
create policy "roulette_runs_select" on roulette_runs for select using (true);

drop policy if exists "reroll_votes_select" on reroll_votes;
create policy "reroll_votes_select" on reroll_votes for select using (true);

-- =============================================================================
-- 3) RPC: roulette
-- =============================================================================
create or replace function public.start_group_roulette(
  p_group_id uuid,
  p_reroll_of_run_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  locs uuid[];
  n int;
  winner uuid;
  seq uuid[] := array[]::uuid[];
  tick int := 110;
  total int := 42;
  i int;
  pick int;
  new_id uuid;
  t_start timestamptz := now();
begin
  if p_reroll_of_run_id is not null then
    if exists (
      select 1 from roulette_runs r
      where r.reroll_of_run_id = p_reroll_of_run_id
    ) then
      return json_build_object('skipped', true, 'reason', 'reroll_already_used');
    end if;
  end if;

  select coalesce(array_agg(l.id), array[]::uuid[])
  into locs
  from locations l
  where l.group_id = p_group_id;

  n := coalesce(cardinality(locs), 0);
  if n < 1 then
    raise exception 'no_locations' using errcode = 'P0001';
  end if;

  select l.id into winner
  from locations l
  where l.group_id = p_group_id
  order by random()
  limit 1;

  for i in 1..(total - 6) loop
    pick := 1 + floor(random() * n)::int;
    if pick > n then pick := n; end if;
    if pick < 1 then pick := 1; end if;
    seq := array_append(seq, locs[pick]);
  end loop;

  for i in 1..6 loop
    seq := array_append(seq, winner);
  end loop;

  insert into roulette_runs (
    group_id, started_at, winner_location_id, sequence_ids, tick_ms, status, reroll_of_run_id
  )
  values (p_group_id, t_start, winner, seq, tick, 'spinning', p_reroll_of_run_id)
  returning id into new_id;

  return json_build_object(
    'id', new_id,
    'group_id', p_group_id,
    'started_at', t_start,
    'winner_location_id', winner,
    'sequence_ids', seq,
    'tick_ms', tick,
    'status', 'spinning',
    'reroll_of_run_id', p_reroll_of_run_id
  );
end;
$$;

create or replace function public.vote_reroll(
  p_run_id uuid,
  p_member_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  g_id uuid;
  m_count int;
  v_count int;
  new_run json;
begin
  select r.group_id into g_id
  from roulette_runs r
  where r.id = p_run_id;

  if g_id is null then
    raise exception 'run_not_found' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from group_members gm
    where gm.id = p_member_id and gm.group_id = g_id
  ) then
    raise exception 'not_group_member' using errcode = 'P0001';
  end if;

  insert into reroll_votes (roulette_run_id, member_id)
  values (p_run_id, p_member_id)
  on conflict (roulette_run_id, member_id) do nothing;

  select count(*)::int into m_count from group_members where group_id = g_id;
  select count(*)::int into v_count from reroll_votes where roulette_run_id = p_run_id;

  if m_count > 0 and v_count * 2 > m_count then
    new_run := public.start_group_roulette(g_id, p_run_id);
    return jsonb_build_object(
      'vote_count', v_count,
      'member_count', m_count,
      'majority', true,
      'new_run', to_jsonb(new_run)
    );
  end if;

  return jsonb_build_object(
    'vote_count', v_count,
    'member_count', m_count,
    'majority', false
  );
end;
$$;

grant execute on function public.start_group_roulette(uuid, uuid) to anon;
grant execute on function public.start_group_roulette(uuid, uuid) to authenticated;
grant execute on function public.vote_reroll(uuid, uuid) to anon;
grant execute on function public.vote_reroll(uuid, uuid) to authenticated;

-- =============================================================================
-- 4) RPC: invite change, admin cleanup, purge
-- =============================================================================
create or replace function public.change_group_invite_code(
  p_group_id uuid,
  p_member_id uuid,
  p_new_code text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
  c text;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.creator_member_id is null or g.creator_member_id is distinct from p_member_id then
    raise exception 'not_group_creator' using errcode = 'P0001';
  end if;

  c := upper(trim(p_new_code));
  if length(c) <> 6 or c !~ '^[A-Z0-9]+$' then
    raise exception 'invalid_invite_code' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from groups x
    where x.invite_code = c and x.id <> p_group_id
  ) then
    raise exception 'invite_code_taken' using errcode = 'P0001';
  end if;

  update groups set invite_code = c where id = p_group_id;

  return json_build_object('ok', true, 'invite_code', c);
end;
$$;

grant execute on function public.change_group_invite_code(uuid, uuid, text) to anon;
grant execute on function public.change_group_invite_code(uuid, uuid, text) to authenticated;

create or replace function public.admin_purge_all()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update groups set creator_member_id = null;
  delete from groups;
end;
$$;

revoke all on function public.admin_purge_all() from public;
grant execute on function public.admin_purge_all() to service_role;

create or replace function public.cleanup_stale_groups()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  delete from groups g
  where (
    not exists (select 1 from roulette_runs r where r.group_id = g.id)
    and g.created_at < now() - interval '7 days'
  )
  or (
    exists (select 1 from roulette_runs r where r.group_id = g.id)
    and (
      select max(r.started_at)
      from roulette_runs r
      where r.group_id = g.id
    ) < now() - interval '7 days'
  );

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.cleanup_stale_groups() from public;
grant execute on function public.cleanup_stale_groups() to service_role;

-- =============================================================================
-- 5) RPC: remove member, delete group
-- =============================================================================
create or replace function public.remove_group_member(
  p_group_id uuid,
  p_actor_member_id uuid,
  p_target_member_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
  n int;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.creator_member_id is null or g.creator_member_id is distinct from p_actor_member_id then
    raise exception 'not_group_creator' using errcode = 'P0001';
  end if;

  if p_target_member_id = p_actor_member_id then
    raise exception 'cannot_remove_self' using errcode = 'P0001';
  end if;

  delete from group_members
  where id = p_target_member_id and group_id = p_group_id;

  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'member_not_found' using errcode = 'P0001';
  end if;

  return json_build_object('ok', true);
end;
$$;

create or replace function public.delete_group_by_creator(
  p_group_id uuid,
  p_member_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.creator_member_id is null or g.creator_member_id is distinct from p_member_id then
    raise exception 'not_group_creator' using errcode = 'P0001';
  end if;

  delete from groups where id = p_group_id;

  return json_build_object('ok', true);
end;
$$;

-- =============================================================================
-- RPC: leave a group (remove current member; transfer creator if needed)
-- =============================================================================
create or replace function public.leave_group(
  p_group_id uuid,
  p_member_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
  remaining_creator uuid;
  n int;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from group_members gm
    where gm.id = p_member_id and gm.group_id = p_group_id
  ) then
    raise exception 'member_not_found' using errcode = 'P0001';
  end if;

  -- If the creator leaves, hand control to someone else.
  if g.creator_member_id is not null and g.creator_member_id = p_member_id then
    select gm.id into remaining_creator
    from group_members gm
    where gm.group_id = p_group_id and gm.id <> p_member_id
    order by gm.created_at asc
    limit 1;

    update groups
    set creator_member_id = remaining_creator
    where id = p_group_id;
  end if;

  delete from group_members
  where id = p_member_id and group_id = p_group_id;

  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'member_not_found' using errcode = 'P0001';
  end if;

  -- If the group is now empty, delete it entirely.
  if not exists (
    select 1 from group_members gm where gm.group_id = p_group_id
  ) then
    delete from groups where id = p_group_id;
  end if;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.leave_group(uuid, uuid) to anon;
grant execute on function public.leave_group(uuid, uuid) to authenticated;

create or replace function public.transfer_group_creator(
  p_group_id uuid,
  p_actor_member_id uuid,
  p_target_member_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.creator_member_id is null or g.creator_member_id is distinct from p_actor_member_id then
    raise exception 'not_group_creator' using errcode = 'P0001';
  end if;

  if p_target_member_id is null or p_target_member_id = p_actor_member_id then
    raise exception 'invalid_target_member' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from group_members gm
    where gm.id = p_target_member_id and gm.group_id = p_group_id
  ) then
    raise exception 'target_not_group_member' using errcode = 'P0001';
  end if;

  update groups
  set creator_member_id = p_target_member_id
  where id = p_group_id;

  return json_build_object('ok', true, 'creator_member_id', p_target_member_id);
end;
$$;

create or replace function public.claim_group_creator(
  p_group_id uuid,
  p_member_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from group_members gm
    where gm.id = p_member_id and gm.group_id = p_group_id
  ) then
    raise exception 'not_group_member' using errcode = 'P0001';
  end if;

  if g.creator_member_id is not null and exists (
    select 1 from group_members gm
    where gm.id = g.creator_member_id and gm.group_id = p_group_id
  ) then
    raise exception 'creator_already_exists' using errcode = 'P0001';
  end if;

  update groups
  set creator_member_id = p_member_id
  where id = p_group_id;

  return json_build_object('ok', true, 'creator_member_id', p_member_id);
end;
$$;

grant execute on function public.remove_group_member(uuid, uuid, uuid) to anon;
grant execute on function public.remove_group_member(uuid, uuid, uuid) to authenticated;
grant execute on function public.delete_group_by_creator(uuid, uuid) to anon;
grant execute on function public.delete_group_by_creator(uuid, uuid) to authenticated;
grant execute on function public.transfer_group_creator(uuid, uuid, uuid) to anon;
grant execute on function public.transfer_group_creator(uuid, uuid, uuid) to authenticated;
grant execute on function public.claim_group_creator(uuid, uuid) to anon;
grant execute on function public.claim_group_creator(uuid, uuid) to authenticated;

-- =============================================================================
-- 6) RPC: owner recovery key (bcrypt — needs extensions on search_path)
-- =============================================================================
create or replace function public.set_group_recovery_key(
  p_group_id uuid,
  p_member_id uuid,
  p_plain text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  g record;
begin
  if length(trim(coalesce(p_plain, ''))) < 4 then
    raise exception 'recovery_key_too_short' using errcode = 'P0001';
  end if;

  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.creator_member_id is null or g.creator_member_id is distinct from p_member_id then
    raise exception 'not_group_creator' using errcode = 'P0001';
  end if;

  update groups
  set recovery_key_hash = crypt(p_plain, gen_salt('bf', 8))
  where id = p_group_id;

  return json_build_object('ok', true);
end;
$$;

create or replace function public.recover_group_access(
  p_invite_code text,
  p_recovery_key text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  g record;
  c text;
begin
  c := upper(trim(p_invite_code));
  if length(c) <> 6 then
    raise exception 'bad_invite' using errcode = 'P0001';
  end if;

  select * into g from groups where invite_code = c;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.recovery_key_hash is null then
    raise exception 'no_recovery_set' using errcode = 'P0001';
  end if;

  if not (crypt(p_recovery_key, g.recovery_key_hash) = g.recovery_key_hash) then
    raise exception 'bad_recovery_key' using errcode = 'P0001';
  end if;

  return json_build_object('ok', true, 'group_id', g.id);
end;
$$;

grant execute on function public.set_group_recovery_key(uuid, uuid, text) to anon;
grant execute on function public.set_group_recovery_key(uuid, uuid, text) to authenticated;
grant execute on function public.recover_group_access(text, text) to anon;
grant execute on function public.recover_group_access(text, text) to authenticated;

-- =============================================================================
-- 7) RPC: join, member password, recover session, room lock
-- =============================================================================
create or replace function public.join_group(
  p_invite_code text,
  p_display_name text,
  p_device_id text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
  existing uuid;
  c text;
  tname text;
begin
  tname := trim(coalesce(p_display_name, ''));
  if length(tname) < 1 then
    raise exception 'empty_name' using errcode = 'P0001';
  end if;

  c := upper(trim(coalesce(p_invite_code, '')));
  if length(c) <> 6 then
    raise exception 'bad_invite' using errcode = 'P0001';
  end if;

  select * into g from groups where invite_code = c;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  select m.id into existing
  from group_members m
  where m.group_id = g.id and m.device_id = p_device_id;

  -- Disallow duplicate display names within the same group (case/space-insensitive),
  -- except for the same device reusing its own member row.
  if exists (
    select 1
    from group_members m
    where m.group_id = g.id
      and trim(lower(m.display_name)) = trim(lower(tname))
      and m.device_id <> p_device_id
  ) then
    raise exception 'name_taken' using errcode = 'P0001';
  end if;

  if existing is null and coalesce(g.join_locked, false) then
    raise exception 'room_locked' using errcode = 'P0001';
  end if;

  insert into group_members (group_id, display_name, device_id)
  values (g.id, tname, p_device_id)
  on conflict (group_id, device_id) do update
  set display_name = excluded.display_name;

  return json_build_object('ok', true, 'group_id', g.id);
end;
$$;

create or replace function public.join_group_by_group_id(
  p_group_id uuid,
  p_display_name text,
  p_device_id text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
  existing uuid;
  tname text;
begin
  tname := trim(coalesce(p_display_name, ''));
  if length(tname) < 1 then
    raise exception 'empty_name' using errcode = 'P0001';
  end if;

  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  select m.id into existing
  from group_members m
  where m.group_id = g.id and m.device_id = p_device_id;

  if exists (
    select 1
    from group_members m
    where m.group_id = g.id
      and trim(lower(m.display_name)) = trim(lower(tname))
      and m.device_id <> p_device_id
  ) then
    raise exception 'name_taken' using errcode = 'P0001';
  end if;

  if existing is null and coalesce(g.join_locked, false) then
    raise exception 'room_locked' using errcode = 'P0001';
  end if;

  insert into group_members (group_id, display_name, device_id)
  values (g.id, tname, p_device_id)
  on conflict (group_id, device_id) do update
  set display_name = excluded.display_name;

  return json_build_object('ok', true, 'group_id', g.id);
end;
$$;

create or replace function public.set_member_password(
  p_group_id uuid,
  p_device_id text,
  p_plain text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  n int;
begin
  if length(trim(coalesce(p_plain, ''))) < 4 then
    raise exception 'member_password_too_short' using errcode = 'P0001';
  end if;

  update group_members
  set member_password_hash = crypt(p_plain, gen_salt('bf', 8))
  where group_id = p_group_id and device_id = p_device_id;

  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'member_not_found' using errcode = 'P0001';
  end if;

  return json_build_object('ok', true);
end;
$$;

create or replace function public.recover_member_session(
  p_invite_code text,
  p_display_name text,
  p_password text,
  p_device_id text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  g record;
  r record;
  c text;
  tname text;
begin
  c := upper(trim(coalesce(p_invite_code, '')));
  if length(c) <> 6 then
    raise exception 'bad_invite' using errcode = 'P0001';
  end if;

  tname := trim(coalesce(p_display_name, ''));
  if length(tname) < 1 then
    raise exception 'empty_name' using errcode = 'P0001';
  end if;

  select * into g from groups where invite_code = c;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  for r in
    select m.id, m.member_password_hash
    from group_members m
    where m.group_id = g.id
      and trim(lower(m.display_name)) = trim(lower(tname))
      and m.member_password_hash is not null
  loop
    if crypt(p_password, r.member_password_hash) = r.member_password_hash then
      update group_members
      set device_id = p_device_id
      where id = r.id;
      return json_build_object(
        'ok', true,
        'group_id', g.id,
        'member_id', r.id
      );
    end if;
  end loop;

  raise exception 'bad_member_credentials' using errcode = 'P0001';
end;
$$;

create or replace function public.set_group_join_locked(
  p_group_id uuid,
  p_member_id uuid,
  p_locked boolean
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  g record;
begin
  select * into g from groups where id = p_group_id;
  if not found then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;

  if g.creator_member_id is null or g.creator_member_id is distinct from p_member_id then
    raise exception 'not_group_creator' using errcode = 'P0001';
  end if;

  update groups
  set join_locked = coalesce(p_locked, false)
  where id = p_group_id;

  return json_build_object('ok', true, 'join_locked', coalesce(p_locked, false));
end;
$$;

grant execute on function public.join_group(text, text, text) to anon;
grant execute on function public.join_group(text, text, text) to authenticated;
grant execute on function public.join_group_by_group_id(uuid, text, text) to anon;
grant execute on function public.join_group_by_group_id(uuid, text, text) to authenticated;
grant execute on function public.set_member_password(uuid, text, text) to anon;
grant execute on function public.set_member_password(uuid, text, text) to authenticated;
grant execute on function public.recover_member_session(text, text, text, text) to anon;
grant execute on function public.recover_member_session(text, text, text, text) to authenticated;
grant execute on function public.set_group_join_locked(uuid, uuid, boolean) to anon;
grant execute on function public.set_group_join_locked(uuid, uuid, boolean) to authenticated;

-- =============================================================================
-- 8) Realtime (tables the app subscribes to)
-- =============================================================================
do $pub$
begin
  alter publication supabase_realtime add table roulette_runs;
exception when duplicate_object then null;
end $pub$;

do $pub$
begin
  alter publication supabase_realtime add table reroll_votes;
exception when duplicate_object then null;
end $pub$;

do $pub$
begin
  alter publication supabase_realtime add table group_members;
exception when duplicate_object then null;
end $pub$;

do $pub$
begin
  alter publication supabase_realtime add table locations;
exception when duplicate_object then null;
end $pub$;

do $pub$
begin
  alter publication supabase_realtime add table groups;
exception when duplicate_object then null;
end $pub$;

-- =============================================================================
-- Done. Wait ~30–60s, then test the app (create group, lock room, passwords).
-- =============================================================================
