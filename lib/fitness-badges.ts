import type { BadgeDefinition, FitnessActivity, FitnessBadge } from './types';
import { startOfDay, differenceInDays } from 'date-fns';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Cardio Badges
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first workout',
    emoji: '👟',
    category: 'cardio',
    condition: (activities) => activities.length >= 1
  },
  {
    id: '5k_runner',
    name: '5K Runner',
    description: 'Run 5km in a single session',
    emoji: '🏃',
    category: 'cardio',
    condition: (activities) => 
      activities.some(a => a.type === 'run' && (a.distance || 0) >= 5)
  },
  {
    id: '10k_runner',
    name: '10K Champion',
    description: 'Run 10km in a single session',
    emoji: '🏃‍♂️',
    category: 'cardio',
    condition: (activities) => 
      activities.some(a => a.type === 'run' && (a.distance || 0) >= 10)
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Run 42km in a week',
    emoji: '🏅',
    category: 'cardio',
    condition: (activities) => {
      const weeklyRuns = activities.filter(a => 
        a.type === 'run' && 
        differenceInDays(new Date(), new Date(a.date)) <= 7
      );
      const totalDistance = weeklyRuns.reduce((sum, a) => sum + (a.distance || 0), 0);
      return totalDistance >= 42;
    }
  },
  {
    id: 'century_cyclist',
    name: 'Century Cyclist',
    description: 'Bike 100km in a week',
    emoji: '🚴',
    category: 'cardio',
    condition: (activities) => {
      const weeklyRides = activities.filter(a => 
        a.type === 'bike' && 
        differenceInDays(new Date(), new Date(a.date)) <= 7
      );
      const totalDistance = weeklyRides.reduce((sum, a) => sum + (a.distance || 0), 0);
      return totalDistance >= 100;
    }
  },
  {
    id: 'ocean_swimmer',
    name: 'Ocean Swimmer',
    description: 'Swim 10km total',
    emoji: '🏊',
    category: 'cardio',
    condition: (activities) => {
      const totalSwim = activities
        .filter(a => a.type === 'swim')
        .reduce((sum, a) => sum + (a.distance || 0), 0);
      return totalSwim >= 10;
    }
  },

  // Strength Badges
  {
    id: 'iron_lifter',
    name: 'Iron Lifter',
    description: 'Complete 10 gym sessions',
    emoji: '💪',
    category: 'strength',
    condition: (activities) => 
      activities.filter(a => a.type === 'gym').length >= 10
  },
  {
    id: 'beast_mode',
    name: 'Beast Mode',
    description: 'Complete 20 gym sessions',
    emoji: '🏋️',
    category: 'strength',
    condition: (activities) => 
      activities.filter(a => a.type === 'gym').length >= 20
  },
  {
    id: 'diamond_grinder',
    name: 'Diamond Grinder',
    description: 'Complete 50 gym sessions',
    emoji: '💎',
    category: 'strength',
    condition: (activities) => 
      activities.filter(a => a.type === 'gym').length >= 50
  },

  // Streak Badges
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Workout 3 days in a row',
    emoji: '🔥',
    category: 'streak',
    condition: (activities) => {
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
      
      return streak >= 3;
    }
  },
  {
    id: 'lightning_streak',
    name: 'Lightning Streak',
    description: 'Workout 7 days in a row',
    emoji: '⚡',
    category: 'streak',
    condition: (activities) => {
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
      
      return streak >= 7;
    }
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Workout 30 days in a row',
    emoji: '🌟',
    category: 'streak',
    condition: (activities) => {
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
      
      return streak >= 30;
    }
  },

  // Special Badges
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Workout after 10 PM',
    emoji: '🦉',
    category: 'special',
    condition: (activities) => 
      activities.some(a => {
        const hour = new Date(a.date).getHours();
        return hour >= 22 || hour < 5;
      })
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Workout before 6 AM',
    emoji: '🐓',
    category: 'special',
    condition: (activities) => 
      activities.some(a => new Date(a.date).getHours() < 6)
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 weekend workouts',
    emoji: '🎉',
    category: 'special',
    condition: (activities) => {
      const weekendWorkouts = activities.filter(a => {
        const day = new Date(a.date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      return weekendWorkouts.length >= 10;
    }
  },
  {
    id: 'hundred_club',
    name: '100 Club',
    description: 'Complete 100 total workouts',
    emoji: '💯',
    category: 'special',
    condition: (activities) => activities.length >= 100
  }
];

export function checkBadgeUnlocks(
  friendId: string,
  activities: FitnessActivity[],
  existingBadges: FitnessBadge[]
): BadgeDefinition[] {
  const unlockedBadgeTypes = new Set(existingBadges.map(b => b.badgeType));
  const newlyUnlocked: BadgeDefinition[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (!unlockedBadgeTypes.has(badge.id) && badge.condition(activities, existingBadges)) {
      newlyUnlocked.push(badge);
    }
  }

  return newlyUnlocked;
}

export function getBadgeInfo(badgeType: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === badgeType);
}

export function getBadgesByCategory(category: BadgeDefinition['category']): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(b => b.category === category);
}
