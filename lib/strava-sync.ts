import { createClient as createServerClient } from './supabase/server';
import { getValidStravaToken, updateLastSync } from './strava-storage';
import { addFitnessActivity } from './fitness-storage';
import { estimateCalories } from './calorie-estimator';
import { FitnessActivity } from './types';
import { format } from 'date-fns';

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_heartrate?: number;
  calories?: number;
}

const STRAVA_TYPE_MAP: Record<string, FitnessActivity['type']> = {
  Run: 'run',
  Ride: 'bike',
  Swim: 'swim',
  WeightTraining: 'gym',
  Yoga: 'yoga',
  Walk: 'walk',
  Hike: 'hike',
  VirtualRide: 'bike',
  VirtualRun: 'run',
};

function mapStravaType(stravaType: string): FitnessActivity['type'] {
  return STRAVA_TYPE_MAP[stravaType] || 'other';
}

function calculatePoints(
  type: FitnessActivity['type'],
  distance: number,
  duration: number
): number {
  if (type === 'run' || type === 'bike' || type === 'walk' || type === 'hike' || type === 'swim') {
    return Math.round(distance * 10);
  }
  
  if (type === 'gym') {
    return Math.round((duration / 10) * 5);
  }
  
  if (type === 'yoga') {
    return Math.round((duration / 10) * 3);
  }
  
  return Math.round((duration / 10) * 3);
}

async function getFriendIdByAthleteId(athleteId: number): Promise<string | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('strava_connections')
    .select('friend_id')
    .eq('athlete_id', athleteId)
    .single();

  if (error || !data) {
    console.error('Could not find friend for athlete:', athleteId, error);
    return null;
  }

  return data.friend_id;
}

async function checkActivityExists(stravaId: number): Promise<boolean> {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('fitness_activities')
    .select('id')
    .eq('strava_id', stravaId.toString())
    .single();

  return !!data;
}

export async function syncStravaActivity(
  athleteId: number,
  activityId: number
): Promise<boolean> {
  try {
    const friendId = await getFriendIdByAthleteId(athleteId);

    if (!friendId) {
      console.error('No friend found for athlete:', athleteId);
      return false;
    }

    const exists = await checkActivityExists(activityId);
    if (exists) {
      console.log('Activity already synced:', activityId);
      return true;
    }

    const accessToken = await getValidStravaToken(friendId);

    if (!accessToken) {
      console.error('No valid Strava token for friend:', friendId);
      return false;
    }

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch activity from Strava:', await response.text());
      return false;
    }

    const activity: StravaActivity = await response.json();

    const distanceKm = activity.distance / 1000;
    const durationMinutes = Math.round(activity.moving_time / 60);
    const type = mapStravaType(activity.type);
    const points = calculatePoints(type, distanceKm, durationMinutes);
    
    // Use Strava calories if available, otherwise estimate
    const calories = activity.calories || estimateCalories(type, distanceKm, durationMinutes);

    const fitnessActivity: Omit<FitnessActivity, 'id' | 'createdAt' | 'points'> = {
      friendId,
      type,
      date: format(new Date(activity.start_date_local), 'yyyy-MM-dd'),
      duration: durationMinutes,
      distance: distanceKm,
      calories: calories,
      heartRate: activity.average_heartrate ? Math.round(activity.average_heartrate) : undefined,
      source: 'strava',
      stravaId: activity.id.toString(),
      notes: activity.name,
    };

    const created = await addFitnessActivity(fitnessActivity);

    if (created) {
      await updateLastSync(friendId);
      console.log('Successfully synced Strava activity:', activityId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error syncing Strava activity:', error);
    return false;
  }
}

export async function syncRecentActivities(friendId: string): Promise<number> {
  try {
    const accessToken = await getValidStravaToken(friendId);

    if (!accessToken) {
      console.error('No valid Strava token for friend:', friendId);
      return 0;
    }

    // Fetch list of activities (summary data only - no calories in this endpoint)
    const response = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=30',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch activities from Strava');
      return 0;
    }

    const activities: StravaActivity[] = await response.json();

    let syncedCount = 0;

    for (const activity of activities) {
      const exists = await checkActivityExists(activity.id);
      if (exists) {
        continue;
      }

      // Fetch detailed activity to get calories data (not available in list endpoint)
      const detailResponse = await fetch(
        `https://www.strava.com/api/v3/activities/${activity.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!detailResponse.ok) {
        console.error(`Failed to fetch detailed activity ${activity.id}`);
        continue;
      }

      const detailedActivity: StravaActivity = await detailResponse.json();

      const distanceKm = detailedActivity.distance / 1000;
      const durationMinutes = Math.round(detailedActivity.moving_time / 60);
      const type = mapStravaType(detailedActivity.type);
      const points = calculatePoints(type, distanceKm, durationMinutes);
      
      // Use Strava calories if available, otherwise estimate
      const calories = detailedActivity.calories || estimateCalories(type, distanceKm, durationMinutes);

      const fitnessActivity: Omit<FitnessActivity, 'id' | 'createdAt' | 'points'> = {
        friendId,
        type,
        date: format(new Date(detailedActivity.start_date_local), 'yyyy-MM-dd'),
        duration: durationMinutes,
        distance: distanceKm,
        calories: calories,
        heartRate: detailedActivity.average_heartrate ? Math.round(detailedActivity.average_heartrate) : undefined,
        source: 'strava',
        stravaId: detailedActivity.id.toString(),
        notes: detailedActivity.name,
      };

      const created = await addFitnessActivity(fitnessActivity);
      if (created) {
        syncedCount++;
      }
    }

    if (syncedCount > 0) {
      await updateLastSync(friendId);
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing recent activities:', error);
    return 0;
  }
}
