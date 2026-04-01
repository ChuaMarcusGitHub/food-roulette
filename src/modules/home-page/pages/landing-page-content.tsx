import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  getDeviceId,
  getStoredGroupId,
  setStoredGroupId,
  generateUniqueInviteCode,
} from "@/lib/utils";
import { t } from "@translate";
import { getSupabase, isSupabaseConfigured, createGroup, setGroupCreator, joinGroupByCode, setMemberPassword } from "@/lib/supabase";
import { useNotice } from "@/lib/hooks/use-notice";
import { Notice } from "@/lib/components";
import { MIN_PASSWORD_LENGTH, INVITE_CODE_LENGTH } from "@/constants";
import { PATHS } from "@/routes";

export const LandingPageContent = () => {
  const navigate = useNavigate();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();
  const { notice, showNotice } = useNotice();

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
      showNotice(t("home.err_group_name"), true);
      return;
    }
    if (!you) {
      showNotice(t("home.err_your_name"), true);
      return;
    }
    if (pw.length < MIN_PASSWORD_LENGTH) {
      showNotice(t("home.err_recovery"), true);
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
      showNotice(err instanceof Error ? err.message : "Error", true);
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
      showNotice(t("home.err_invite_len"), true);
      return;
    }
    if (!you) {
      showNotice(t("home.err_join_name"), true);
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
          showNotice(t("home.err_room_locked"), true);
        else if (/group_not_found|bad_invite/i.test(error))
          showNotice(t("home.err_no_group"), true);
        else if (/name_taken/i.test(error))
          showNotice(t("home.err_name_taken"), true);
        else if (/empty_name/i.test(error))
          showNotice(t("home.err_join_name"), true);
        else showNotice(error, true);
        return;
      }
      const gid = data?.group_id;
      if (!gid) {
        showNotice(t("home.err_no_group"), true);
        return;
      }
      setStoredGroupId(gid);
      navigate(PATHS.GROUP.replace(":groupId", gid));
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Error", true);
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-16 pt-14">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {t("common.app_name")}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {t("home.err_env")}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-16 pt-14">
      <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-700">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t("common.app_name")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("home.tagline")}
        </p>
      </header>

      <Notice notice={notice} className="mb-6" />

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("home.create_title")}
        </h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {t("home.retention_warning")}
        </p>
        <form onSubmit={handleCreateGroup} className="mt-3 flex flex-col gap-3">
          <input
            type="text"
            placeholder={t("home.group_name_ph")}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            disabled={busy}
          />
          <input
            type="text"
            placeholder={t("home.your_name_ph")}
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            disabled={busy}
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder={t("home.recovery_key_ph")}
            value={memberPassword}
            onChange={(e) => setMemberPasswordState(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            disabled={busy}
          />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t("home.recovery_hint")}
          </p>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {t("home.create_cta")}
          </button>
        </form>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("home.join_title")}
        </h2>
        <form onSubmit={handleJoinGroup} className="mt-3 flex flex-col gap-3">
          <input
            type="text"
            placeholder={t("home.join_name_ph")}
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            disabled={busy}
          />
          <input
            type="text"
            placeholder={t("home.invite_ph")}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={INVITE_CODE_LENGTH}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono tracking-widest text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("home.join_cta")}
          </button>
        </form>
      </section>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        <Link
          to={PATHS.RECOVER}
          className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800 dark:text-teal-400"
        >
          {t("home.recover_link")}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("home.auto_redirect")}
      </p>
    </main>
  );
};
