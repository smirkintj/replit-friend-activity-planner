import { NextRequest, NextResponse } from 'next/server';
import { getStravaConnectionServer, StravaConnectionStatus } from '@/lib/strava-storage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const friendId = searchParams.get('friend_id');

  if (!friendId) {
    return NextResponse.json({ error: 'Missing friend_id' }, { status: 400 });
  }

  const connection = await getStravaConnectionServer(friendId);

  if (!connection) {
    return NextResponse.json<StravaConnectionStatus>({ isConnected: false });
  }

  return NextResponse.json<StravaConnectionStatus>({
    isConnected: true,
    lastSyncAt: connection.last_sync_at || undefined,
    connectedAt: connection.connected_at,
  });
}
