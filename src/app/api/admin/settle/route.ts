import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDb } from "~/lib/mongodb";

const ADMIN_FID = 1441046;

const settleSchema = z.object({
  adminFid: z.number().int().positive(),
  matchupId: z.string().min(1),
  correctWinner: z.enum(["home", "away"]),
  correctJerseyTotal: z.number().int().min(0).max(9999),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = settleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { adminFid, matchupId, correctWinner, correctJerseyTotal } =
      parsed.data;

    if (adminFid !== ADMIN_FID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getMongoDb();
    const guesses = db.collection("guesses");

    const docs = await guesses
      .find({ matchupId })
      .sort({ createdAt: 1 })
      .toArray();

    if (!docs.length) {
      return NextResponse.json(
        { error: "No guesses found for this matchup." },
        { status: 404 },
      );
    }

    const eligible = docs.filter(
      (g: any) => g.winnerPick === correctWinner,
    );

    if (!eligible.length) {
      return NextResponse.json(
        { error: "No guesses on the correct side." },
        { status: 404 },
      );
    }

    let winner = eligible[0];
    let bestDiff = Math.abs(
      eligible[0].jerseySumGuess - correctJerseyTotal,
    );

    for (let i = 1; i < eligible.length; i++) {
      const diff = Math.abs(
        eligible[i].jerseySumGuess - correctJerseyTotal,
      );
      if (diff < bestDiff) {
        bestDiff = diff;
        winner = eligible[i];
      }
    }

    return NextResponse.json({
      matchupId,
      correctWinner,
      correctJerseyTotal,
      totalGuesses: docs.length,
      eligibleGuesses: eligible.length,
      winner: {
        fid: winner.fid,
        jerseySumGuess: winner.jerseySumGuess,
        winnerPick: winner.winnerPick,
        createdAt: winner.createdAt,
        diff: bestDiff,
      },
    });
  } catch (error) {
    console.error("Failed to settle matchup:", error);
    return NextResponse.json(
      { error: "Failed to settle matchup" },
      { status: 500 },
    );
  }
}


