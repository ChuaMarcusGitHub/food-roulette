import type { SupabaseClient } from "@/lib/supabase/client";
import type { IRouletteRun, INormalisedRun } from "../types";
import { DEFAULT_TICK_MS } from "@/constants";

/** Normalise a raw roulette run row into the client shape. */
export function normaliseRun(
  row: Partial<IRouletteRun> | null,
): INormalisedRun | null {
  if (!row) return null;
  return {
    id: row.id ?? "",
    group_id: row.group_id ?? "",
    started_at: row.started_at ?? "",
    winner_location_id: row.winner_location_id ?? null,
    sequence_ids: row.sequence_ids ?? [],
    tick_ms: row.tick_ms ?? DEFAULT_TICK_MS,
  };
}

/** Parse the JSON returned by start_group_roulette RPC. */
export function parseRpcRun(raw: unknown): INormalisedRun | null {
  if (!raw || typeof raw !== "object") return null;
  return normaliseRun(raw as Partial<IRouletteRun>);
}

/** Fetch the latest roulette run for a group. */
export async function fetchLatestRun(
  supabase: SupabaseClient,
  groupId: string,
): Promise<INormalisedRun | null> {
  const { data } = await supabase
    .from("roulette_runs")
    .select("*")
    .eq("group_id", groupId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? normaliseRun(data as IRouletteRun) : null;
}

/** Fetch vote member_ids for a run. */
export async function fetchVotes(
  supabase: SupabaseClient,
  runId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("reroll_votes")
    .select("member_id")
    .eq("roulette_run_id", runId);
  return (data ?? []).map((r: { member_id: string }) => r.member_id);
}

/** RPC: start_group_roulette. */
export async function startRoulette(
  supabase: SupabaseClient,
  groupId: string,
): Promise<{
  run: INormalisedRun | null;
  skipped: boolean;
  error: string | null;
}> {
  let { data, error  } = await supabase.rpc("start_group_roulette", {
    p_group_id: groupId,
  });
  if (error) return { run: null, skipped: false, error: error.message };
  if (typeof data === "string") {
    try {
      data = JSON.parse(data) as unknown;
    } catch {
      data = null;
    }
  }
  if ((data as Record<string, unknown>)?.skipped)
    return { run: null, skipped: true, error: null };
  return { run: parseRpcRun(data), skipped: false, error: null };
}

interface VoteResult {
  majority: boolean;
  new_run?: unknown;
}

/** RPC: vote_reroll. */
export async function voteReroll(
  supabase: SupabaseClient,
  runId: string,
  memberId: string,
): Promise<{
  newRun: INormalisedRun | null;
  majority: boolean;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("vote_reroll", {
    p_run_id: runId,
    p_member_id: memberId,
  });
  if (error) return { newRun: null, majority: false, error: error.message };
  const result = data as VoteResult | null;
  let newRun: INormalisedRun | null = null;
  if (result?.majority && result.new_run) {
    let nr: unknown = result.new_run;
    if (typeof nr === "string") {
      try {
        nr = JSON.parse(nr) as unknown;
      } catch {
        nr = null;
      }
    }
    if (
      nr &&
      typeof nr === "object" &&
      !(nr as Record<string, unknown>).skipped &&
      Array.isArray((nr as Record<string, unknown>).sequence_ids) &&
      ((nr as Record<string, unknown>).sequence_ids as unknown[]).length
    ) {
      newRun = parseRpcRun(nr);
    }
  }
  return { newRun, majority: result?.majority ?? false, error: null };
}
