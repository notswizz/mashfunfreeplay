import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-primary">
        {user?.pfp_url && (
          <div tw="flex w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white">
            <img src={user.pfp_url} alt="Profile" tw="w-full h-full object-cover" />
          </div>
        )}
        <h1 tw="text-6xl text-white">{user?.display_name ? `${user.display_name ?? user.username}` : 'Mash.fun Jersey Number Free Play'}</h1>
        <p tw="text-3xl mt-4 text-white opacity-80">Guess the jersey number total that scores.</p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}