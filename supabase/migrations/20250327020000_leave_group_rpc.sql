-- Leave group:
-- - delete this device's group_members row
-- - if the leaving member is creator, transfer creator_member_id to another member
-- - if no members remain, delete the group

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

