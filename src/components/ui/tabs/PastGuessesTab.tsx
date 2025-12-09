"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { CURRENT_MATCHUP, MATCHUP_LABELS } from "~/lib/game";

type PastGuess = {
  id: string;
  matchupId: string;
  fid: number;
  jerseySumGuess: number;
  winnerPick: "home" | "away";
  createdAt: string;
};

export function PastGuessesTab() {
  const { context } = useMiniApp();
  const [guesses, setGuesses] = useState<PastGuess[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!context?.user?.fid) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/guess?fid=${context.user.fid}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load guesses.");
          return;
        }

        setGuesses(data.guesses ?? []);
      } catch (e) {
        console.error(e);
        setError("Failed to load guesses.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [context?.user?.fid]);

  if (!context?.user) {
    return (
      <div className="text-xs text-slate-400">
        Open this in the Farcaster mini app to see your past guesses.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-slate-300">
        Loading your guesses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-300">
        {error}
      </div>
    );
  }

  if (!guesses.length) {
    return (
      <div className="text-xs text-slate-400">
        No guesses yet. Make your first pick for{" "}
        <span className="font-semibold">
          {CURRENT_MATCHUP.awayTeam} at {CURRENT_MATCHUP.homeTeam}
        </span>
        .
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs text-slate-100">
      {guesses.map((g) => {
        const mapping = MATCHUP_LABELS[g.matchupId];
        const gameLabel = mapping
          ? mapping.label
          : g.matchupId;
        const sideTeam = mapping
          ? g.winnerPick === "home"
            ? mapping.homeTeam
            : mapping.awayTeam
          : g.winnerPick === "home"
            ? "Home team"
            : "Away team";

        const isLive = g.matchupId === CURRENT_MATCHUP.id;

        return (
          <div
            key={g.id}
            className={
              isLive
                ? "rounded-2xl p-[1.5px] bg-gradient-to-r from-primary via-emerald-400 to-primary animate-pulse"
                : ""
            }
          >
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/95 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {gameLabel}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(g.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="mt-0.5 text-[11px] text-slate-400">
                  Pick:{" "}
                  <span className="font-medium">{sideTeam}</span>
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">
                  Jersey total
                </p>
                <p className="text-lg font-semibold">
                  {g.jerseySumGuess}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


