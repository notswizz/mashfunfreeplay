"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { CURRENT_MATCHUP } from "~/lib/game";

type ExistingGuess = {
  jerseySumGuess: number;
  winnerPick: "home" | "away";
  createdAt: string;
};

export function HomeTab() {
  const { context } = useMiniApp();

  const [winnerPick, setWinnerPick] = useState<"home" | "away">("home");
  const [jerseySumGuess, setJerseySumGuess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [existingGuess, setExistingGuess] = useState<ExistingGuess | null>(
    null,
  );

  // Load any existing guess for this fid + matchup on mount
  useEffect(() => {
    const loadExisting = async () => {
      if (!context?.user?.fid) return;

      try {
        const res = await fetch(`/api/guess?fid=${context.user.fid}`);
        const data = await res.json();

        if (!res.ok) {
          return;
        }

        const match = (data.guesses ?? []).find(
          (g: any) => g.matchupId === CURRENT_MATCHUP.id,
        );

        if (match) {
          setExistingGuess({
            jerseySumGuess: match.jerseySumGuess,
            winnerPick: match.winnerPick,
            createdAt: match.createdAt,
          });
          setWinnerPick(match.winnerPick);
          setJerseySumGuess(String(match.jerseySumGuess));
          setHasGuessed(true);
          setMessage("Your guess is locked in. Good luck!");
        }
      } catch (e) {
        console.error("Failed to load existing guess", e);
      }
    };

    loadExisting();
  }, [context?.user?.fid]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!context?.user) {
      setError("You need to be in a Farcaster mini app context to play.");
      return;
    }

    const numericGuess = Number(jerseySumGuess);
    if (!Number.isFinite(numericGuess) || !Number.isInteger(numericGuess)) {
      setError("Enter a whole number for the jersey number total.");
      return;
    }

    if (numericGuess < 0 || numericGuess > 9999) {
      setError("Keep the jersey number total between 0 and 9999.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchupId: CURRENT_MATCHUP.id,
          fid: context.user.fid,
          jerseySumGuess: numericGuess,
          winnerPick,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit guess.");
        return;
      }

      setMessage("Your guess is locked in. Good luck!");
      setHasGuessed(true);
    } catch (e) {
      console.error(e);
      setError("Something went wrong submitting your guess. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const homeFavored = CURRENT_MATCHUP.spread < 0;
  const absSpread = Math.abs(CURRENT_MATCHUP.spread);

  return (
    <div className="flex items-start justify-center">
      <div className="w-full space-y-4">
        {/* Compact matchup + line card with animated outline */}
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-primary via-emerald-400 to-primary animate-pulse">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/95 px-4 py-3 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="uppercase tracking-[0.18em]">
                Free play
              </span>
              <span>{CURRENT_MATCHUP.kickoff}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <p className="font-semibold text-slate-50">
                  {CURRENT_MATCHUP.awayTeam}
                </p>
                <p className="text-xs text-slate-300">
                  at {CURRENT_MATCHUP.homeTeam}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Spread{" "}
                  <span className="font-semibold text-emerald-300">
                    {homeFavored
                      ? `${CURRENT_MATCHUP.homeTeam} -${absSpread}`
                      : `${CURRENT_MATCHUP.awayTeam} -${absSpread}`}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  Jersey line
                </p>
                <p className="mt-1 text-3xl font-semibold text-slate-50 leading-none">
                  {CURRENT_MATCHUP.jerseySumLine}
                </p>
              </div>
            </div>
          </div>
        </div>

        {existingGuess ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-50">
                Your guess
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-300 border border-emerald-400/40">
                Locked in
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Jersey total
                </span>
                <span className="text-3xl font-semibold text-slate-50 leading-tight">
                  {existingGuess.jerseySumGuess}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Team
                </span>
                <span className="block text-sm font-semibold text-slate-50">
                  {existingGuess.winnerPick === "home"
                    ? CURRENT_MATCHUP.homeTeam
                    : CURRENT_MATCHUP.awayTeam}
                </span>
                <span className="mt-1 block text-[10px] text-slate-500">
                  {new Date(existingGuess.createdAt).toLocaleTimeString(
                    undefined,
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 space-y-3 shadow-inner"
          >
            <h2 className="text-sm font-semibold text-slate-50">
              Make your pick
            </h2>

            {!context?.user && (
              <p className="text-xs text-amber-300">
                Open this in the Farcaster mini app to play and make a guess.
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-100">
                Side
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`btn text-xs py-2 ${
                    winnerPick === "away" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setWinnerPick("away")}
                  disabled={hasGuessed}
                >
                  {CURRENT_MATCHUP.awayTeam}
                </button>
                <button
                  type="button"
                  className={`btn text-xs py-2 ${
                    winnerPick === "home" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setWinnerPick("home")}
                  disabled={hasGuessed}
                >
                  {CURRENT_MATCHUP.homeTeam}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-100">
                Your jersey total
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={9999}
                step={1}
                className="input text-sm bg-slate-900/80 border-slate-700 text-slate-50 placeholder:text-slate-400"
                placeholder="Enter your jersey number total"
                value={jerseySumGuess}
                onChange={(e) => setJerseySumGuess(e.target.value)}
                disabled={hasGuessed}
              />
              <p className="text-[11px] text-slate-500">1 guess per FID.</p>
            </div>

            {error && (
              <p className="text-xs text-red-300">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-emerald-300">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full text-sm mt-1 shadow-[0_12px_30px_rgba(139,92,246,0.55)]"
              disabled={isSubmitting || hasGuessed || !context?.user}
            >
              {hasGuessed
                ? "You already guessed"
                : isSubmitting
                  ? "Submitting..."
                  : "Lock in your guess"}
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-400 text-center">
          Winner gets a{" "}
          <span className="font-semibold">$5 </span>
          <span className="font-semibold bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent animate-pulse">
            Mash.fun
          </span>{" "}
          <span className="font-semibold">free play</span>.
        </p>
      </div>
    </div>
  );
}
