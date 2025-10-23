import { NextRequest, NextResponse } from 'next/server';
import { getValidStravaToken } from '@/lib/strava-storage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const friendId = searchParams.get('friendId');

  if (!friendId) {
    return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
  }

  try {
    const accessToken = await getValidStravaToken(friendId);

    if (!accessToken) {
      return NextResponse.json({ error: 'No Strava connection found' }, { status: 404 });
    }

    // Fetch athlete profile
    const profileResponse = await fetch(
      'https://www.strava.com/api/v3/athlete',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!profileResponse.ok) {
      console.error('Failed to fetch Strava profile:', await profileResponse.text());
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    const profile = await profileResponse.json();

    // Fetch athlete stats
    const statsResponse = await fetch(
      `https://www.strava.com/api/v3/athletes/${profile.id}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let stats = null;
    if (statsResponse.ok) {
      stats = await statsResponse.json();
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        username: profile.username,
        firstname: profile.firstname,
        lastname: profile.lastname,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        sex: profile.sex,
        premium: profile.premium,
        summit: profile.summit,
        createdAt: profile.created_at,
        profilePhoto: profile.profile_medium || profile.profile,
        weight: profile.weight,
        bio: profile.bio,
      },
      stats: stats ? {
        allTime: {
          runs: {
            count: stats.all_run_totals?.count || 0,
            distance: Math.round((stats.all_run_totals?.distance || 0) / 1000), // km
            movingTime: Math.round((stats.all_run_totals?.moving_time || 0) / 3600), // hours
            elevationGain: Math.round(stats.all_run_totals?.elevation_gain || 0), // meters
          },
          rides: {
            count: stats.all_ride_totals?.count || 0,
            distance: Math.round((stats.all_ride_totals?.distance || 0) / 1000), // km
            movingTime: Math.round((stats.all_ride_totals?.moving_time || 0) / 3600), // hours
            elevationGain: Math.round(stats.all_ride_totals?.elevation_gain || 0), // meters
          },
          swims: {
            count: stats.all_swim_totals?.count || 0,
            distance: Math.round((stats.all_swim_totals?.distance || 0) / 1000), // km
            movingTime: Math.round((stats.all_swim_totals?.moving_time || 0) / 3600), // hours
          },
        },
        ytd: {
          runs: {
            count: stats.ytd_run_totals?.count || 0,
            distance: Math.round((stats.ytd_run_totals?.distance || 0) / 1000),
            movingTime: Math.round((stats.ytd_run_totals?.moving_time || 0) / 3600),
            elevationGain: Math.round(stats.ytd_run_totals?.elevation_gain || 0),
          },
          rides: {
            count: stats.ytd_ride_totals?.count || 0,
            distance: Math.round((stats.ytd_ride_totals?.distance || 0) / 1000),
            movingTime: Math.round((stats.ytd_ride_totals?.moving_time || 0) / 3600),
            elevationGain: Math.round(stats.ytd_ride_totals?.elevation_gain || 0),
          },
          swims: {
            count: stats.ytd_swim_totals?.count || 0,
            distance: Math.round((stats.ytd_swim_totals?.distance || 0) / 1000),
            movingTime: Math.round((stats.ytd_swim_totals?.moving_time || 0) / 3600),
          },
        },
        recent: {
          runs: {
            count: stats.recent_run_totals?.count || 0,
            distance: Math.round((stats.recent_run_totals?.distance || 0) / 1000),
            movingTime: Math.round((stats.recent_run_totals?.moving_time || 0) / 3600),
            elevationGain: Math.round(stats.recent_run_totals?.elevation_gain || 0),
          },
          rides: {
            count: stats.recent_ride_totals?.count || 0,
            distance: Math.round((stats.recent_ride_totals?.distance || 0) / 1000),
            movingTime: Math.round((stats.recent_ride_totals?.moving_time || 0) / 3600),
            elevationGain: Math.round(stats.recent_ride_totals?.elevation_gain || 0),
          },
          swims: {
            count: stats.recent_swim_totals?.count || 0,
            distance: Math.round((stats.recent_swim_totals?.distance || 0) / 1000),
            movingTime: Math.round((stats.recent_swim_totals?.moving_time || 0) / 3600),
          },
        },
      } : null,
    });
  } catch (error) {
    console.error('Error fetching Strava profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
