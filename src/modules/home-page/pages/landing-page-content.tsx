import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  getDeviceId,
  getStoredGroupId,
  setStoredGroupId,
  generateUniqueInviteCode,
} from "@/lib/utils";
import { t } from "@translate";
import {
  getSupabase,
  isSupabaseConfigured,
  createGroup,
  setGroupCreator,
  joinGroupByCode,
  setMemberPassword,
} from "@/lib/supabase";
import { useNotice } from "@/lib/hooks/use-notice";
import { MIN_PASSWORD_LENGTH, INVITE_CODE_LENGTH } from "@/constants";
import { PATHS } from "@/routes";
import { Button, GroupLabel, Input, LinkRecover, Text } from "@/lib/components";

export const LandingPageContent = () => {
  const navigate = useNavigate();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();
  const { postNotice } = useNotice();

  const [newGroupName, setNewGroupName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [memberPassword, setMemberPasswordState] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const postErrorNotice = (message: string) => {
    postNotice({ text: message });
  };

  const autoRedirect = useCallback(async () => {
    if (!supabase) return;
    const gid = getStoredGroupId();
    if (!gid) return;
    const deviceId = getDeviceId();
    if (!deviceId) return;
    const { data: member } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", gid)
      .eq("device_id", deviceId)
      .maybeSingle();
    if (member)
      navigate(PATHS.GROUP.replace(":groupId", gid), { replace: true });
  }, [supabase, navigate]);

  useEffect(() => {
    if (hydrated && configured) void autoRedirect();
  }, [hydrated, configured, autoRedirect]);

  async function handleCreateGroup(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const gName = newGroupName.trim();
    const you = creatorName.trim();
    const pw = memberPassword.trim();
    if (!gName) {
      postErrorNotice(t("home.err_group_name"));
      return;
    }
    if (!you) {
      postErrorNotice(t("home.err_your_name"));
      return;
    }
    if (pw.length < MIN_PASSWORD_LENGTH) {
      postErrorNotice(t("home.err_recovery"));
      return;
    }
    setBusy(true);
    try {
      const inviteCode = await generateUniqueInviteCode(supabase);
      const { data: group, error: gErr } = await createGroup(
        supabase,
        gName,
        inviteCode,
      );
      if (gErr || !group) throw new Error(gErr ?? "Could not create group");

      const deviceId = getDeviceId();
      if (!deviceId) throw new Error(t("common.err_device_id"));

      const { data: memRow, error: mErr } = await supabase
        .from("group_members")
        .upsert(
          { group_id: group.id, display_name: you, device_id: deviceId },
          { onConflict: "group_id,device_id" },
        )
        .select("id")
        .single();
      if (mErr) throw new Error(mErr.message);

      const creatorErr = await setGroupCreator(supabase, group.id, memRow.id);
      if (creatorErr) throw new Error(creatorErr);

      const setPwErr = await setMemberPassword(
        supabase,
        group.id,
        deviceId,
        pw,
      );
      if (setPwErr) throw new Error(setPwErr);

      setStoredGroupId(group.id);
      navigate(PATHS.GROUP.replace(":groupId", group.id));
    } catch (err: unknown) {
      postErrorNotice(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoinGroup(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const code = joinCode.trim().toUpperCase();
    const you = joinName.trim();
    if (code.length !== INVITE_CODE_LENGTH) {
      postErrorNotice(t("home.err_invite_len"));
      return;
    }
    if (!you) {
      postErrorNotice(t("home.err_join_name"));
      return;
    }
    setBusy(true);
    try {
      const deviceId = getDeviceId();
      if (!deviceId) throw new Error(t("common.err_device_id"));
      const { data, error } = await joinGroupByCode(
        supabase,
        code,
        you,
        deviceId,
      );
      if (error) {
        if (/room_locked/i.test(error))
          postErrorNotice(t("home.err_room_locked"));
        else if (/group_not_found|bad_invite/i.test(error))
          postErrorNotice(t("home.err_no_group"));
        else if (/name_taken/i.test(error))
          postErrorNotice(t("home.err_name_taken"));
        else if (/empty_name/i.test(error))
          postErrorNotice(t("home.err_join_name"));
        else postErrorNotice(error);
        return;
      }
      const gid = data?.group_id;
      if (!gid) {
        postErrorNotice(t("home.err_no_group"));
        return;
      }
      setStoredGroupId(gid);
      navigate(PATHS.GROUP.replace(":groupId", gid));
    } catch (err: unknown) {
      postNotice({
        text: err instanceof Error ? err.message : "Error",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <>
        <Text variant={"h1"}>{t("common.app_name")}</Text>
        <Text className="mt-3">{t("home.err_env")}</Text>
      </>
    );
  }

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-700">
        <Text variant={"h1"}>{t("common.app_name")}</Text>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("home.tagline")}
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <GroupLabel label={t("home.create_title")} />
        <Text className="mt-2">{t("home.retention_warning")}</Text>
        <form onSubmit={handleCreateGroup} className="mt-3 flex flex-col gap-3">
          <Input type={"text"} placeholder={t("home.group_name_ph")} value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} disabled={busy} />
          <Input type={"text"} placeholder={t("home.your_name_ph")} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} disabled={busy} />
          <Input type={"password"} autoComplete={"new-password"} placeholder={t("home.recovery_key_ph")} value={memberPassword} onChange={(e) => setMemberPasswordState(e.target.value)} disabled={busy} />
          <Text variant={"muted"}>{t("home.recovery_hint")}</Text>
          <Button type="submit" intent="primary" disabled={busy}>
            {t("home.create_cta")}
          </Button>
        </form>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <GroupLabel label={t("home.join_title")} />
        <form onSubmit={handleJoinGroup} className="mt-3 flex flex-col gap-3">
          <Input type={"text"} placeholder={t("home.join_name_ph")} value={joinName} onChange={(e) => setJoinName(e.target.value)} disabled={busy} />
          <Input intent={"mono"} type={"text"} placeholder={t("home.invite_ph")} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={INVITE_CODE_LENGTH} disabled={busy} />
          <Button type="submit" intent="ghost" disabled={busy}>
            {t("home.join_cta")}
          </Button>
        </form>
      </section>

      <LinkRecover
        className={
          "text-center text-sm font-medium underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
        }
      />
      <Text variant={"muted"} className={"mt-3 text-center"}>
        {t("home.auto_redirect")}
      </Text>
    </>
  );
};
