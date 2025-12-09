export type MatchupSide = "home" | "away";

export interface Matchup {
  id: string;
  homeTeam: string;
  awayTeam: string;
  spread: number; // homeTeam - awayTeam spread (e.g. -3.5 means home favored)
  jerseySumLine: number; // line for cumulative jersey numbers that score
  kickoff: string; // human-readable, not used for logic
  note?: string;
}

// Hard-coded example matchup.
// Update these values for each new contest you run.
export const CURRENT_MATCHUP: Matchup = {
  id: "week-1-phi-lac",
  homeTeam: "Los Angeles Chargers",
  awayTeam: "Philadelphia Eagles",
  // Positive value here means the away team is favored in the UI label.
  spread: 2.5, // PHI -2.5
  jerseySumLine: 178,
  kickoff: "Mon 8:15pm ET",
  note: "Guess the total jersey numbers for all players who score a TD.",
};

// Optional lookup for friendly labels for previously used matchups.
export const MATCHUP_LABELS: Record<
  string,
  { label: string; homeTeam: string; awayTeam: string }
> = {
  "week-1-phi-lac": {
    label: "Eagles @ Chargers",
    homeTeam: "Los Angeles Chargers",
    awayTeam: "Philadelphia Eagles",
  },
  "week-1-buf-nyj": {
    label: "Bills @ Jets",
    homeTeam: "New York Jets",
    awayTeam: "Buffalo Bills",
  },
};

