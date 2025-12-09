import { NextResponse } from "next/server";
import { getFarcasterDomainManifest } from "~/lib/utils";

export const dynamic = "force-static";

export async function GET() {
  const manifest = await getFarcasterDomainManifest();
  return NextResponse.json(manifest);
}


