-- Supabase installs pgcrypto in schema `extensions`. Functions that use
-- set search_path = public only cannot resolve gen_salt() / crypt().
-- This updates existing deployments; new installs get the fix from the
-- create-or-replace migrations.

do $fix$
begin
  begin
    execute $s$
      alter function public.set_group_recovery_key(uuid, uuid, text)
      set search_path to public, extensions
    $s$;
  exception
    when undefined_function then null;
  end;

  begin
    execute $s$
      alter function public.recover_group_access(text, text)
      set search_path to public, extensions
    $s$;
  exception
    when undefined_function then null;
  end;

  begin
    execute $s$
      alter function public.set_member_password(uuid, text, text)
      set search_path to public, extensions
    $s$;
  exception
    when undefined_function then null;
  end;

  begin
    execute $s$
      alter function public.recover_member_session(text, text, text, text)
      set search_path to public, extensions
    $s$;
  exception
    when undefined_function then null;
  end;
end
$fix$;
