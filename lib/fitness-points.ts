import type { FitnessActivity } from './types';
import { startOfDay, differenceInDays } from 'date-fns';

export function calculateActivityPoints(
  type: FitnessActivity['type'],
  duration: number, // minutes
  distance?: number, // km
  heartRate?: number, // average HR for effort-based scoring
): number {
  let points = 0;

  switch (type) {
    case 'run':
    case 'bike':
    case 'swim':
    case 'walk':
    case 'hike':
      // Cardio: 10 points per km
      points = Math.round((distance || 0) * 10);
      break;
    
    case 'hiit':
      // HIIT: effort × duration formula
      // Effort calculated from heart rate (normalized to 0.5-2.0 range)
      // Default effort multiplier is 1.5 if no HR data
      const effortMultiplier = heartRate 
        ? Math.min(2.0, Math.max(0.5, (heartRate - 100) / 100 + 1))
        : 1.5;
      points = Math.round(effortMultiplier * duration);
      break;
    
    case 'gym':
      // Strength: 5 points per 10 minutes
      points = Math.round((duration / 10) * 5);
      break;
    
    case 'yoga':
    case 'other':
      // Recovery: 3 points per 10 minutes
      points = Math.round((duration / 10) * 3);
      break;
  }

  return Math.max(points, 1); // Minimum 1 point for any activity
}

export function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak >= 7) {
    return 50; // 7-day streak bonus
  } else if (currentStreak >= 3) {
    return 20; // 3-day streak bonus
  }
  return 0;
}

export function calculateFirstOfDayBonus(
  activities: FitnessActivity[],
  newActivity: FitnessActivity
): number {
  const activityDate = startOfDay(new Date(newActivity.date));
  
  // Check if this is the first activity of the day among all friends
  const earlierTodayActivities = activities.filter(a => {
    const aDate = startOfDay(new Date(a.date));
    return aDate.getTime() === activityDate.getTime() && 
           new Date(a.date) < new Date(newActivity.date);
  });

  return earlierTodayActivities.length === 0 ? 20 : 0;
}

export function calculateCurrentStreak(activities: FitnessActivity[]): number {
  if (activities.length === 0) return 0;

  // Sort activities by date descending
  const sorted = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = startOfDay(new Date());
  
  for (const activity of sorted) {
    const activityDate = startOfDay(new Date(activity.date));
    const daysDiff = differenceInDays(currentDate, activityDate);

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = activityDate;
    } else {
      break;
    }
  }

  return streak;
}

export function getActivityIcon(type: FitnessActivity['type']): string {
  const icons: Record<FitnessActivity['type'], string> = {
    run: '🏃',
    bike: '🚴',
    swim: '🏊',
    gym: '💪',
    yoga: '🧘',
    walk: '🚶',
    hike: '🥾',
    hiit: '🔥',
    other: '⚡'
  };
  return icons[type];
}

export function getActivityColor(type: FitnessActivity['type']): string {
  const colors: Record<FitnessActivity['type'], string> = {
    run: 'from-blue-500 to-blue-600',
    bike: 'from-green-500 to-green-600',
    swim: 'from-cyan-500 to-cyan-600',
    gym: 'from-purple-500 to-purple-600',
    yoga: 'from-pink-500 to-pink-600',
    walk: 'from-amber-500 to-amber-600',
    hike: 'from-emerald-500 to-emerald-600',
    hiit: 'from-red-500 to-orange-600',
    other: 'from-gray-500 to-gray-600'
  };
  return colors[type];
}
