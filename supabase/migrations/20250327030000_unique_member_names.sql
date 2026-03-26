-- Enforce unique member display names within a group (case/space-insensitive)
-- for join RPCs. This prevents confusing duplicates in the UI.

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

grant execute on function public.join_group(text, text, text) to anon;
grant execute on function public.join_group(text, text, text) to authenticated;
grant execute on function public.join_group_by_group_id(uuid, text, text) to anon;
grant execute on function public.join_group_by_group_id(uuid, text, text) to authenticated;

