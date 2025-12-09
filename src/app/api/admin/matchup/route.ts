import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDb } from "~/lib/mongodb";

const ADMIN_FID = 1441046;

const matchupSchema = z.object({
  adminFid: z.number().int().positive(),
  matchupId: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  spread: z.number(),
  jerseySumLine: z.number().int().min(0),
  kickoff: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = matchupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      adminFid,
      matchupId,
      homeTeam,
      awayTeam,
      spread,
      jerseySumLine,
      kickoff,
    } = parsed.data;

    if (adminFid !== ADMIN_FID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getMongoDb();
    const matchups = db.collection("matchups");

    await matchups.updateOne(
      { matchupId },
      {
        $set: {
          matchupId,
          homeTeam,
          awayTeam,
          spread,
          jerseySumLine,
          kickoff,
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      matchupId,
      homeTeam,
      awayTeam,
      spread,
      jerseySumLine,
      kickoff,
    });
  } catch (error) {
    console.error("Failed to save matchup:", error);
    return NextResponse.json(
      { error: "Failed to save matchup" },
      { status: 500 },
    );
  }
}


