-- Per-member password (bcrypt) + creator join lock

create extension if not exists pgcrypto;

alter table groups add column if not exists join_locked boolean not null default false;

alter table group_members add column if not exists member_password_hash text;

alter table group_members drop column if exists password_set;
alter table group_members add column password_set boolean
  generated always as (member_password_hash is not null) stored;
-- password_set is safe to expose to the client (no hash)

-- Join by invite code (respects join_locked for new devices)
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

-- Join when user opened a direct group link (same lock rules)
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

-- Only the row for this device in this group
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

-- Re-link device after proving invite + name + password
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
