-- Fixes: "Could not find the function public.set_member_password(...)"
-- Usually means this RPC was never applied. Safe to run more than once.

create extension if not exists pgcrypto with schema extensions;

alter table groups add column if not exists join_locked boolean not null default false;

alter table group_members add column if not exists member_password_hash text;

do $body$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'group_members'
      and column_name = 'password_set'
  ) then
    alter table group_members
      add column password_set boolean
      generated always as (member_password_hash is not null) stored;
  end if;
end
$body$;

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

grant execute on function public.set_member_password(uuid, text, text) to anon;
grant execute on function public.set_member_password(uuid, text, text) to authenticated;
