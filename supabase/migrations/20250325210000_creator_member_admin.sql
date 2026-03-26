-- Creator: remove a member from the group; creator: delete the whole group

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

grant execute on function public.remove_group_member(uuid, uuid, uuid) to anon;
grant execute on function public.remove_group_member(uuid, uuid, uuid) to authenticated;
grant execute on function public.delete_group_by_creator(uuid, uuid) to anon;
grant execute on function public.delete_group_by_creator(uuid, uuid) to authenticated;

do $$
begin
  alter publication supabase_realtime add table groups;
exception
  when duplicate_object then null;
end $$;
