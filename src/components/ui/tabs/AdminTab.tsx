"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { CURRENT_MATCHUP } from "~/lib/game";

type SettleResult = {
  matchupId: string;
  correctWinner: "home" | "away";
  correctJerseyTotal: number;
  totalGuesses: number;
  eligibleGuesses: number;
  winner?: {
    fid: number;
    jerseySumGuess: number;
    winnerPick: "home" | "away";
    createdAt: string;
    diff: number;
  };
  error?: string;
};

export function AdminTab() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid;

  const [matchupId, setMatchupId] = useState(CURRENT_MATCHUP.id);
  const [homeTeam, setHomeTeam] = useState(CURRENT_MATCHUP.homeTeam);
  const [awayTeam, setAwayTeam] = useState(CURRENT_MATCHUP.awayTeam);
  const [spread, setSpread] = useState(CURRENT_MATCHUP.spread.toString());
  const [jerseyLine, setJerseyLine] = useState(
    CURRENT_MATCHUP.jerseySumLine.toString(),
  );
  const [correctWinner, setCorrectWinner] = useState<"home" | "away">("home");
  const [correctTotal, setCorrectTotal] = useState("");
  const [result, setResult] = useState<SettleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (fid !== 1441046) {
    return (
      <div className="text-xs text-slate-400">
        Admin only. Open as FID 1441046 to manage games.
      </div>
    );
  }

  useEffect(() => {
    const loadLock = async () => {
      try {
        const res = await fetch(
          `/api/admin/lock?matchupId=${encodeURIComponent(matchupId)}`,
        );
        const data = await res.json();
        if (res.ok) {
          setLocked(!!data.locked);
        }
      } catch {
        // ignore
      }
    };
    loadLock();
  }, [matchupId]);

  const handleSaveMatchup = async () => {
    setSaveStatus(null);
    setError(null);

    const spreadNum = Number(spread);
    const jerseyNum = Number(jerseyLine);
    if (!Number.isFinite(spreadNum) || !Number.isFinite(jerseyNum)) {
      setError("Spread and jersey line must be numbers.");
      return;
    }

    try {
      const res = await fetch("/api/admin/matchup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminFid: fid,
          matchupId,
          homeTeam,
          awayTeam,
          spread: spreadNum,
          jerseySumLine: jerseyNum,
          kickoff: CURRENT_MATCHUP.kickoff,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save matchup.");
        return;
      }
      setSaveStatus("Matchup saved.");
    } catch (e) {
      console.error(e);
      setError("Failed to save matchup.");
    }
  };

  const handleToggleLock = async () => {
    setIsLocking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminFid: fid,
          matchupId,
          locked: !locked,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update lock state.");
        return;
      }
      setLocked(data.locked);
    } catch (e) {
      console.error(e);
      setError("Failed to update lock state.");
    } finally {
      setIsLocking(false);
    }
  };

  const handleSettle = async () => {
    setError(null);
    setResult(null);

    const numericTotal = Number(correctTotal);
    if (!Number.isInteger(numericTotal) || numericTotal < 0) {
      setError("Enter a whole number jersey total.");
      return;
    }

    setIsSettling(true);
    try {
      const res = await fetch("/api/admin/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminFid: fid,
          matchupId,
          correctWinner,
          correctJerseyTotal: numericTotal,
        }),
      });
      const data: SettleResult = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to settle matchup.");
        return;
      }
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Failed to settle matchup.");
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-3 text-xs text-slate-100">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Admin – current game
        </p>
        <div className="space-y-1">
          <label className="block">
            <span className="text-[11px] text-slate-400">Matchup ID</span>
            <input
              className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
              value={matchupId}
              onChange={(e) => setMatchupId(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] text-slate-400">Away</span>
              <input
                className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-400">Home</span>
              <input
                className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] text-slate-400">Spread (home - away)</span>
              <input
                className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
                value={spread}
                onChange={(e) => setSpread(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-400">Jersey line</span>
              <input
                className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
                value={jerseyLine}
                onChange={(e) => setJerseyLine(e.target.value)}
              />
            </label>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="space-x-2">
              <button
                type="button"
                className="btn btn-primary text-[11px] px-3 py-1"
                onClick={handleSaveMatchup}
              >
                Save matchup
              </button>
              <button
                type="button"
                className="btn btn-outline text-[11px] px-3 py-1"
                onClick={handleToggleLock}
                disabled={isLocking}
              >
                {locked ? "Unlock guesses" : "Lock guesses"}
              </button>
            </div>
            {locked && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] text-red-300 border border-red-400/40">
                Locked
              </span>
            )}
          </div>
          {saveStatus && (
            <p className="text-[10px] text-emerald-300 mt-1">{saveStatus}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Settle winner
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11px] text-slate-400">Correct side</span>
            <select
              className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
              value={correctWinner}
              onChange={(e) =>
                setCorrectWinner(e.target.value as "home" | "away")
              }
            >
              <option value="away">{awayTeam} (away)</option>
              <option value="home">{homeTeam} (home)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] text-slate-400">Final jersey total</span>
            <input
              type="number"
              className="input text-xs mt-0.5 bg-slate-900/80 border-slate-700 text-slate-50"
              value={correctTotal}
              onChange={(e) => setCorrectTotal(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSettle}
          disabled={isSettling}
          className="btn btn-primary w-full text-xs"
        >
          {isSettling ? "Settling..." : "Decide winner"}
        </button>

        {error && (
          <p className="text-[11px] text-red-300">
            {error}
          </p>
        )}

        {result && result.winner && (
          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 space-y-1">
            <p className="text-[11px] text-slate-400">
              Winner FID{" "}
              <span className="font-semibold">{result.winner.fid}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Jersey total{" "}
              <span className="font-semibold">
                {result.winner.jerseySumGuess}
              </span>{" "}
              (diff {result.winner.diff})
            </p>
            <p className="text-[10px] text-slate-500">
              {result.eligibleGuesses} eligible / {result.totalGuesses} total
              guesses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


