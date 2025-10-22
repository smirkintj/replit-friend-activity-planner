import { NextRequest, NextResponse } from 'next/server';
import { saveStravaConnection, StravaTokenResponse } from '@/lib/strava-storage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/fitness?error=strava_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/fitness?error=missing_params`
    );
  }

  const friendId = state;

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Strava token exchange failed:', errorText);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/fitness?error=token_exchange_failed`
      );
    }

    const tokenData: StravaTokenResponse = await tokenResponse.json();

    const saved = await saveStravaConnection(friendId, tokenData);

    if (!saved) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/fitness?error=save_failed`
      );
    }

    return NextResponse.redirect(
      `${request.nextUrl.origin}/fitness?strava=connected`
    );
  } catch (err) {
    console.error('Error in Strava callback:', err);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/fitness?error=unknown`
    );
  }
}
