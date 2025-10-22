import { NextRequest, NextResponse } from 'next/server';
import { deleteStravaConnection } from '@/lib/strava-storage';

export async function POST(request: NextRequest) {
  try {
    const { friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json({ error: 'Missing friend_id' }, { status: 400 });
    }

    const deleted = await deleteStravaConnection(friendId);

    if (deleted) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error disconnecting Strava:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
