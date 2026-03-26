-- Group creator, invite change RPC, admin purge, stale cleanup

alter table groups add column if not exists creator_member_id uuid references group_members (id) on delete set null;

drop policy if exists "groups_update" on groups;
create policy "groups_update" on groups for update using (true) with check (true);

-- Creator-only invite change (validated in RPC)
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

-- Wipe all app data (called only with service role from API)
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

-- Delete stale groups: no roulette for 7+ days (never spun & group old 7d, or last spin >7d ago)
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
