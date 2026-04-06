import { Link, useNavigate } from "react-router-dom";
import { useState, type SubmitEvent } from "react";
import { getDeviceId, setStoredGroupId } from "@/lib/utils/device";
import { t } from "@translate";
import {
  getSupabase,
  isSupabaseConfigured,
  recoverMemberSession,
} from "@/lib/supabase";
import { useNotice } from "@/lib/hooks/use-notice";
import { INVITE_CODE_LENGTH } from "@/constants";
import { PATHS } from "@/routes";
import { Button, GroupLabel, Input, PText } from "@/lib/components";

export const LandingPageContent = () => {
  const navigate = useNavigate();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();
  const { postNotice } = useNotice();

  const [mInvite, setMInvite] = useState("");
  const [mName, setMName] = useState("");
  const [mPassword, setMPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleMemberSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const code = mInvite.trim().toUpperCase();
    const name = mName.trim();
    const pw = mPassword.trim();
    if (code.length !== INVITE_CODE_LENGTH) {
      postNotice({ text: t("recover.err_invite") });
      return;
    }
    if (!name) {
      postNotice({ text: t("recover.err_member_name") });
      return;
    }
    if (!pw) {
      postNotice({ text: t("recover.err_member_password") });
      return;
    }
    const deviceId = getDeviceId();
    if (!deviceId) {
      postNotice({ text: t("common.err_device_id") });
      return;
    }
    setBusy(true);
    try {
      const { groupId, error } = await recoverMemberSession(
        supabase,
        code,
        name,
        pw,
        deviceId,
      );
      if (error) throw new Error(error);
      if (!groupId) throw new Error("Invalid response");
      setStoredGroupId(groupId);
      postNotice({ text: t("recover.success"), variant: "success" });
      navigate(PATHS.GROUP.replace(":groupId", groupId), { replace: true });
    } catch (err: unknown) {
      postNotice({ text: err instanceof Error ? err.message : "Error" });
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <>
        <PText variant={"body1"}> {t("group.configure_env")}</PText>
        <Link
          to={PATHS.HOME}
          className="mt-4 inline-block text-teal-600 dark:text-teal-400"
        >
          {t("common.back_home")}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        to={PATHS.HOME}
        className="text-sm text-slate-500 underline dark:text-slate-400"
      >
        {t("recover.back")}
      </Link>
      <header className="mb-8 mt-6 border-b border-slate-200 pb-6 dark:border-slate-700">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {t("recover.title")}
        </h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <GroupLabel label={t("recover.member_section")} />
        <PText className="mt-2">{t("recover.member_subtitle")}</PText>
        <form
          onSubmit={handleMemberSubmit}
          className="mt-4 flex flex-col gap-3"
        >
          <PText variant={"labelXs"} className={"block"}>
            {t("recover.invite_ph")}
          </PText>
          <Input intent={"mono"} type={"text"} value={mInvite} onChange={(e) => setMInvite(e.target.value.toUpperCase())} maxLength={INVITE_CODE_LENGTH} disabled={busy} />
          <PText variant={"labelXs"} className={"mt-1 block"}>
            {t("recover.name_ph")}
          </PText>
          <Input type={"text"} value={mName} onChange={(e) => setMName(e.target.value)} disabled={busy} />
          <PText variant={"labelXs"} className={"mt-1 block"}>
            {t("recover.member_password_ph")}
          </PText>
          <Input type={"password"} autoComplete={"new-password"} value={mPassword} onChange={(e) => setMPassword(e.target.value)} disabled={busy} />
          <Button
            type="submit"
            intent="submit"
            size="full"
            disabled={busy}
            className="mt-2 border border-slate-200 dark:border-slate-600"
          >
            {t("recover.member_cta")}
          </Button>
        </form>
      </section>
    </>
  );
};
