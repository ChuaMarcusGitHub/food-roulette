-- Safe to re-run: adds member_password_hash + password_set if your DB never ran
-- 20250325240000_member_password_join_lock.sql (or only part of it).

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
