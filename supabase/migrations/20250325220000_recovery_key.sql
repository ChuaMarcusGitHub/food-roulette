-- Owner recovery key (bcrypt hash) + RPCs

create extension if not exists pgcrypto;

alter table groups add column if not exists recovery_key_hash text;

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
