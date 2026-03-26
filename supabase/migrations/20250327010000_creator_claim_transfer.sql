-- Creator fallback and handoff:
-- - creator can transfer control to another member
-- - members can claim creator role when no active creator exists

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

grant execute on function public.transfer_group_creator(uuid, uuid, uuid) to anon;
grant execute on function public.transfer_group_creator(uuid, uuid, uuid) to authenticated;
grant execute on function public.claim_group_creator(uuid, uuid) to anon;
grant execute on function public.claim_group_creator(uuid, uuid) to authenticated;
