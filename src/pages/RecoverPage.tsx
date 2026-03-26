import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { getDeviceId, setStoredGroupId } from "@/lib/utils/device";
import { useLocale } from "@/lib/i18n/locale-provider";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { recoverMemberSession } from "@/lib/supabase/recovery";
import { useNotice } from "@/lib/hooks/useNotice";
import Notice from "@/lib/components/Notice";
import { ROUTES, INVITE_CODE_LENGTH } from "@/constants";

export default function RecoverPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();
  const { notice, showNotice } = useNotice();

  const [mInvite, setMInvite] = useState("");
  const [mName, setMName] = useState("");
  const [mPassword, setMPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleMemberSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const code = mInvite.trim().toUpperCase();
    const name = mName.trim();
    const pw = mPassword.trim();
    if (code.length !== INVITE_CODE_LENGTH) { showNotice(t("recover.errInvite"), true); return; }
    if (!name) { showNotice(t("recover.errMemberName"), true); return; }
    if (!pw) { showNotice(t("recover.errMemberPassword"), true); return; }
    const deviceId = getDeviceId();
    if (!deviceId) { showNotice(t("common.errDeviceId"), true); return; }
    setBusy(true);
    try {
      const { groupId, error } = await recoverMemberSession(supabase, code, name, pw, deviceId);
      if (error) throw new Error(error);
      if (!groupId) throw new Error("Invalid response");
      setStoredGroupId(groupId);
      showNotice(t("recover.success"), false);
      navigate(ROUTES.GROUP(groupId), { replace: true });
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : "Error", true);
    } finally { setBusy(false); }
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-16 pt-14">
        <p className="text-slate-600 dark:text-slate-400">{t("group.configureEnv")}</p>
        <Link to={ROUTES.HOME} className="mt-4 inline-block text-teal-600 dark:text-teal-400">
          {t("common.backHome")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-16 pt-14">
      <Link to={ROUTES.HOME} className="text-sm text-slate-500 underline dark:text-slate-400">
        {t("recover.back")}
      </Link>
      <header className="mb-8 mt-6 border-b border-slate-200 pb-6 dark:border-slate-700">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("recover.title")}</h1>
      </header>

      <Notice notice={notice} className="mb-6" />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("recover.memberSection")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("recover.memberSubtitle")}</p>
        <form onSubmit={handleMemberSubmit} className="mt-4 flex flex-col gap-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("recover.invitePh")}</label>
          <input type="text" value={mInvite} onChange={(e) => setMInvite(e.target.value.toUpperCase())} maxLength={INVITE_CODE_LENGTH}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono tracking-widest dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100" disabled={busy} />
          <label className="mt-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("recover.namePh")}</label>
          <input type="text" value={mName} onChange={(e) => setMName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100" disabled={busy} />
          <label className="mt-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("recover.memberPasswordPh")}</label>
          <input type="password" autoComplete="new-password" value={mPassword} onChange={(e) => setMPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100" disabled={busy} />
          <button type="submit" disabled={busy}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:border-slate-600 dark:bg-teal-800 dark:hover:bg-teal-700">
            {t("recover.memberCta")}
          </button>
        </form>
      </section>
    </main>
  );
}
