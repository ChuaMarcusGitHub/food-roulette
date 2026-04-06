import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { t } from "@translate";
import { PATHS } from "@/routes";
import { IGroup } from "@/lib/types";
import { Button, GroupLabel, Input, LinkRecover, Text } from "@/lib/components";

interface JoinGateProps {
  group: IGroup;
  busy: boolean;
  onJoin: (name: string) => Promise<void>;
}

/** Pre-join gate: shows invite code and a name input. */
export const JoinGate = ({ group, busy, onJoin }: JoinGateProps) => {
  const [joinName, setJoinName] = useState("");
  const locked = !!group.join_locked;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = joinName.trim();
    if (!name) return;
    void onJoin(name);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 pb-16 dark:text-slate-200">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to={PATHS.HOME}
          className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-2 dark:text-slate-400 dark:decoration-slate-600"
        >
          {t("common.back_home")}
        </Link>
        <LinkRecover
          className={"text-sm underline decoration-teal-300 underline-offset-2"}
        />
      </div>

      <header className="mt-6 border-b border-slate-200 pb-6 dark:border-slate-700">
        <Text variant={"h1"}>
          {t("group.join_gate_title", { name: group.name ?? "" })}
        </Text>

        {group.invite_code ? (
          <Text className="mt-2 font-mono">
            {t("group.join_code")}{" "}
            <span className="font-semibold text-teal-800 dark:text-teal-400">
              {group.invite_code}
            </span>
          </Text>
        ) : null}
      </header>

      {locked ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          {t("group.room_locked_hint")}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <GroupLabel label={t("group.join_your_name")} />
        <Text variant={'label'} className="mt-1">
          {t("group.join_hint")}
        </Text>
        <Text variant={"hint"} className="mt-2">
          {t("group.join_tip")}
        </Text>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input
            type={"text"}
            placeholder={t("group.join_placeholder")}
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            disabled={busy}
          />
          <Button type="submit" intent="primary" disabled={busy}>
            {t("group.enter_room")}
          </Button>
        </form>
      </section>
    </div>
  );
};
