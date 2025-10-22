import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const friendId = searchParams.get('friend_id');

  if (!friendId) {
    return NextResponse.json({ error: 'Missing friend_id' }, { status: 400 });
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${request.nextUrl.origin}/api/strava/callback`;

  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId!);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('approval_prompt', 'force');
  authUrl.searchParams.set('scope', 'read,activity:read_all');
  authUrl.searchParams.set('state', friendId);

  return NextResponse.redirect(authUrl.toString());
}
