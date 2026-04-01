import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normaliseRun, fetchLatestRun, fetchVotes, startRoulette, voteReroll } from "@/lib/supabase/roulette";
import type { SupabaseClient } from "@/lib/supabase/client";
import type { ILocation, INormalisedRun, IRouletteRun } from "../types";

type Phase = "idle" | "spinning" | "result";

export interface SpinningContext {
  prev?: ILocation;
  next?: ILocation;
  index: number;
  total: number;
}

export interface UseRouletteReturn {
  phase: Phase;
  showingLoc: ILocation | undefined;
  winnerLoc: ILocation | undefined;
  votes: string[];
  voted: boolean;
  majorityReached: boolean;
  /** 0–1 while spinning; use with `phase === "spinning"` */
  spinProgress: number;
  spinningContext: SpinningContext | null;
  handleStartRoulette: () => Promise<void>;
  handleVoteReroll: () => Promise<void>;
}

/** Roulette animation, realtime sync, and actions. */
export function useRoulette(
  supabase: SupabaseClient | null,
  groupId: string | undefined,
  memberId: string | undefined,
  membersCount: number,
  locations: ILocation[],
  onNotice: (msg: string, isError: boolean) => void,
): UseRouletteReturn {
  const [activeRun, setActiveRun] = useState<INormalisedRun | null>(null);
  const [tickIndex, setTickIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [votes, setVotes] = useState<string[]>([]);
  const [spinProgress, setSpinProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const applyRun = useCallback((row: unknown) => {
    const r = normaliseRun(row as Partial<IRouletteRun>);
    if (!r?.sequence_ids?.length) return;
    setActiveRun(r);
    const start = new Date(r.started_at).getTime();
    const dur = r.sequence_ids.length * r.tick_ms;
    setPhase(Date.now() - start < dur ? "spinning" : "result");
    setTickIndex(0);
  }, []);

  // subscribe to new runs
  useEffect(() => {
    if (!supabase || !groupId) return undefined;
    const ch = supabase
      .channel(`roulette-${groupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "roulette_runs", filter: `group_id=eq.${groupId}` },
        (payload) => { applyRun(payload.new); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, groupId, applyRun]);

  // load latest run on mount
  useEffect(() => {
    if (!supabase || !groupId) return undefined;
    let cancelled = false;
    (async () => {
      const run = await fetchLatestRun(supabase, groupId);
      if (!cancelled && run) applyRun(run);
    })();
    return () => { cancelled = true; };
  }, [supabase, groupId, applyRun]);

  // load & subscribe votes
  useEffect(() => {
    if (!supabase || !activeRun?.id || phase !== "result") {
      setVotes([]);
      return undefined;
    }
    const runId = activeRun.id;
    const client = supabase;
    const loadVotes = async () => {
      const v = await fetchVotes(client, runId);
      setVotes(v);
    };
    loadVotes();
    const ch = client
      .channel(`reroll-votes-${runId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reroll_votes", filter: `roulette_run_id=eq.${runId}` }, () => { loadVotes(); })
      .subscribe();
    return () => { client.removeChannel(ch); };
  }, [supabase, activeRun?.id, phase]);

  // animation loop
  useEffect(() => {
    if (phase !== "spinning" || !activeRun?.sequence_ids?.length) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      return undefined;
    }
    const seq = activeRun.sequence_ids;
    const tick = activeRun.tick_ms;
    const start = new Date(activeRun.started_at).getTime();
    const lastIdx = seq.length - 1;
    const loop = () => {
      const elapsed = Date.now() - start;
      const dur = seq.length * tick;
      setSpinProgress(Math.min(1, elapsed / dur));
      if (elapsed >= dur) {
        setTickIndex(lastIdx);
        setSpinProgress(1);
        setPhase("result");
        rafRef.current = null;
        return;
      }
      setTickIndex(Math.min(Math.floor(elapsed / tick), lastIdx));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [phase, activeRun]);

  const showingLocationId = activeRun?.sequence_ids?.[tickIndex] ?? null;
  const showingLoc = useMemo(
    () => locations.find(l => l.id === showingLocationId),
    [locations, showingLocationId],
  );
  const winnerLoc = useMemo(
    () => locations.find(l => l.id === activeRun?.winner_location_id),
    [locations, activeRun],
  );

  const spinningContext = useMemo((): SpinningContext | null => {
    if (phase !== "spinning" || !activeRun?.sequence_ids?.length) return null;
    const seq = activeRun.sequence_ids;
    const i = tickIndex;
    const prevId = i > 0 ? seq[i - 1] : undefined;
    const nextId = i < seq.length - 1 ? seq[i + 1] : undefined;
    return {
      prev: prevId ? locations.find(l => l.id === prevId) : undefined,
      next: nextId ? locations.find(l => l.id === nextId) : undefined,
      index: i + 1,
      total: seq.length,
    };
  }, [phase, activeRun, tickIndex, locations]);

  useEffect(() => {
    if (phase !== "spinning") setSpinProgress(0);
  }, [phase]);

  const handleStartRoulette = useCallback(async () => {
    if (!supabase || !groupId) return;
    const { run, skipped, error } = await startRoulette(supabase, groupId);
    if (error) { onNotice(error, true); return; }
    if (skipped) return;
    if (run) { setActiveRun(run); setPhase("spinning"); setTickIndex(0); }
  }, [supabase, groupId, onNotice]);

  const handleVoteReroll = useCallback(async () => {
    if (!supabase || !memberId || !activeRun?.id) return;
    const { newRun, error } = await voteReroll(supabase, activeRun.id, memberId);
    if (error) { onNotice(error, true); return; }
    if (newRun) { setActiveRun(newRun); setPhase("spinning"); setTickIndex(0); setVotes([]); }
  }, [supabase, memberId, activeRun?.id, onNotice]);

  const voted = Boolean(memberId && votes.includes(memberId));
  const majorityReached = membersCount > 0 && votes.length * 2 > membersCount;

  return {
    phase,
    showingLoc,
    winnerLoc,
    votes,
    voted,
    majorityReached,
    spinProgress,
    spinningContext,
    handleStartRoulette,
    handleVoteReroll,
  };
}
