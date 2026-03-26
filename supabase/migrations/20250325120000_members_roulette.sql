-- Members, location fields, synced roulette + reroll votes (run after base schema)

-- --- group_members ----------------------------------------------------------
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  display_name text not null,
  device_id text not null,
  created_at timestamptz default now(),
  unique (group_id, device_id)
);

create index if not exists group_members_group_id_idx on group_members (group_id);

-- --- locations: name + who added ------------------------------------------
alter table locations add column if not exists name text;
alter table locations add column if not exists added_by_member_id uuid references group_members (id) on delete set null;

-- --- roulette_runs ----------------------------------------------------------
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

-- --- reroll_votes -----------------------------------------------------------
create table if not exists reroll_votes (
  roulette_run_id uuid not null references roulette_runs (id) on delete cascade,
  member_id uuid not null references group_members (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (roulette_run_id, member_id)
);

-- --- RLS --------------------------------------------------------------------
alter table group_members enable row level security;
alter table roulette_runs enable row level security;
alter table reroll_votes enable row level security;

drop policy if exists "group_members_all" on group_members;
create policy "group_members_all" on group_members for all using (true) with check (true);

drop policy if exists "roulette_runs_select" on roulette_runs;
create policy "roulette_runs_select" on roulette_runs for select using (true);

drop policy if exists "reroll_votes_select" on reroll_votes;
create policy "reroll_votes_select" on reroll_votes for select using (true);

-- locations: allow update for anon MVP (optional); keep insert/select
drop policy if exists "locations_update" on locations;
create policy "locations_update" on locations for update using (true) with check (true);

-- --- RPC: start spin (server picks winner + sequence) -----------------------
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
    group_id,
    started_at,
    winner_location_id,
    sequence_ids,
    tick_ms,
    status,
    reroll_of_run_id
  )
  values (
    p_group_id,
    t_start,
    winner,
    seq,
    tick,
    'spinning',
    p_reroll_of_run_id
  )
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

-- --- RPC: vote reroll; majority triggers next spin --------------------------
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

-- Realtime (ignore error if already added)
do $$
begin
  alter publication supabase_realtime add table roulette_runs;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table reroll_votes;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table group_members;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table locations;
exception
  when duplicate_object then null;
end $$;
