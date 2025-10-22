import { NextRequest, NextResponse } from 'next/server';
import { syncRecentActivities } from '@/lib/strava-sync';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const friendId = searchParams.get('friend_id');

  if (!friendId) {
    return NextResponse.json(
      { error: 'Missing friend_id parameter' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Strava Sync] Starting manual sync for friend: ${friendId}`);
    
    const syncedCount = await syncRecentActivities(friendId);
    
    console.log(`[Strava Sync] Successfully synced ${syncedCount} activities`);
    
    return NextResponse.json({
      success: true,
      syncedCount,
      message: syncedCount > 0 
        ? `Successfully synced ${syncedCount} workout${syncedCount !== 1 ? 's' : ''}!`
        : 'No new activities to sync. All caught up!'
    });
  } catch (error) {
    console.error('[Strava Sync] Error syncing activities:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync activities',
        message: 'Failed to sync activities. Please try again.'
      },
      { status: 500 }
    );
  }
}
