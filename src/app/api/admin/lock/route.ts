import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDb } from "~/lib/mongodb";

const ADMIN_FID = 1441046;

const lockSchema = z.object({
  adminFid: z.number().int().positive(),
  matchupId: z.string().min(1),
  locked: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = lockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { adminFid, matchupId, locked } = parsed.data;

    if (adminFid !== ADMIN_FID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getMongoDb();
    const matchups = db.collection("matchups");

    await matchups.updateOne(
      { matchupId },
      { $set: { matchupId, locked } },
      { upsert: true },
    );

    return NextResponse.json({ matchupId, locked });
  } catch (error) {
    console.error("Failed to update lock state:", error);
    return NextResponse.json(
      { error: "Failed to update lock state" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchupId = searchParams.get("matchupId");

    if (!matchupId) {
      return NextResponse.json(
        { error: "matchupId query param is required" },
        { status: 400 },
      );
    }

    const db = await getMongoDb();
    const matchups = db.collection("matchups");

    const doc = await matchups.findOne({ matchupId });

    return NextResponse.json({
      matchupId,
      locked: !!doc?.locked,
    });
  } catch (error) {
    console.error("Failed to read lock state:", error);
    return NextResponse.json(
      { error: "Failed to read lock state" },
      { status: 500 },
    );
  }
}

