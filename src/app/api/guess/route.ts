import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDb } from "~/lib/mongodb";

const guessSchema = z.object({
  matchupId: z.string().min(1),
  fid: z.number().int().positive(),
  jerseySumGuess: z.number().int().min(0).max(9999),
  winnerPick: z.enum(["home", "away"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = guessSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { matchupId, fid, jerseySumGuess, winnerPick } = parseResult.data;

    const db = await getMongoDb();
    const guesses = db.collection("guesses");
    const matchups = db.collection("matchups");

    // Check if guesses are locked for this matchup
    const matchupDoc = await matchups.findOne({ matchupId });
    if (matchupDoc?.locked) {
      return NextResponse.json(
        { error: "Guesses are locked for this matchup." },
        { status: 403 },
      );
    }

    // Enforce one guess per user per matchup
    const existing = await guesses.findOne({ matchupId, fid });
    if (existing) {
      return NextResponse.json(
        { error: "You already submitted a guess for this matchup." },
        { status: 409 },
      );
    }

    const now = new Date();

    await guesses.insertOne({
      matchupId,
      fid,
      jerseySumGuess,
      winnerPick,
      createdAt: now,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Guess submitted!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to submit guess:", error);
    return NextResponse.json(
      { error: "Failed to submit guess" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get("fid");

    if (!fidParam) {
      return NextResponse.json(
        { error: "fid query param is required" },
        { status: 400 },
      );
    }

    const fid = Number(fidParam);
    if (!Number.isInteger(fid) || fid <= 0) {
      return NextResponse.json(
        { error: "fid must be a positive integer" },
        { status: 400 },
      );
    }

    const db = await getMongoDb();
    const guesses = db.collection("guesses");

    const docs = await guesses
      .find({ fid })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const formatted = docs.map((doc: any) => ({
      id: doc._id?.toString() ?? "",
      matchupId: doc.matchupId,
      fid: doc.fid,
      jerseySumGuess: doc.jerseySumGuess,
      winnerPick: doc.winnerPick,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ guesses: formatted });
  } catch (error) {
    console.error("Failed to fetch guesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch guesses" },
      { status: 500 },
    );
  }
}

