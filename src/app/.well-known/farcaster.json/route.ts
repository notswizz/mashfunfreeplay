import { NextResponse } from "next/server";
import { getFarcasterDomainManifest } from "~/lib/utils";

export const dynamic = "force-static";

export async function GET() {
  try {
    const manifest = await getFarcasterDomainManifest();
    return NextResponse.json(manifest);
  } catch (error) {
    console.error("Error generating Farcaster manifest:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

