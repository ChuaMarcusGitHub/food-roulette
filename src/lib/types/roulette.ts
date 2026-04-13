
/** Row type for `roulette_runs` table. */
export interface IRouletteRun {
  id: string;
  group_id: string;
  started_at: string;
  winner_location_id: string | null;
  sequence_ids: string[];
  tick_ms: number;
  status: string;
  reroll_of_run_id: string | null;
}

/** Normalised roulette run used in the client. */
export interface INormalisedRun {
  id: string;
  group_id: string;
  started_at: string;
  winner_location_id: string | null;
  sequence_ids: string[];
  tick_ms: number;
}


/** Row type for `reroll_votes` table. */
export interface IRerollVote {
  roulette_run_id: string;
  member_id: string;
  created_at: string;
}
