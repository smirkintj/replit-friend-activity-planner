import { createClient } from "@/lib/supabase/client"
import type {
  FitnessActivity,
  FitnessBadge,
  SquadChallenge,
  FitnessStats,
  LeaderboardEntry,
  Friend,
  WeeklyChallenge
} from "./types"
import { calculateActivityPoints, calculateCurrentStreak } from "./fitness-points"
import { checkBadgeUnlocks, BADGE_DEFINITIONS } from "./fitness-badges"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"

// Get all fitness activities (optionally filtered by friend)
export async function getFitnessActivities(friendId?: string): Promise<FitnessActivity[]> {
  const supabase = createClient()
  
  let query = supabase
    .from("fitness_activities")
    .select("*")
    .order("date", { ascending: false })
  
  if (friendId) {
    query = query.eq("friend_id", friendId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error("[Fitness] Error fetching activities:", error)
    return []
  }
  
  return (data || []).map(row => ({
    id: row.id,
    friendId: row.friend_id,
    type: row.type,
    date: row.date,
    duration: row.duration,
    distance: row.distance,
    calories: row.calories,
    heartRate: row.heart_rate,
    points: row.points,
    source: row.source,
    stravaId: row.strava_id,
    notes: row.notes,
    createdAt: row.created_at
  }))
}

// Add a new fitness activity
export async function addFitnessActivity(
  activity: Omit<FitnessActivity, "id" | "createdAt" | "points">
): Promise<FitnessActivity | null> {
  const supabase = createClient()
  
  // Calculate points
  const points = calculateActivityPoints(activity.type, activity.duration, activity.distance)
  
  const { data, error } = await supabase
    .from("fitness_activities")
    .insert({
      friend_id: activity.friendId,
      type: activity.type,
      date: activity.date,
      duration: activity.duration,
      distance: activity.distance,
      calories: activity.calories,
      heart_rate: activity.heartRate,
      points: points,
      source: activity.source,
      strava_id: activity.stravaId,
      notes: activity.notes
    })
    .select()
    .single()
  
  if (error) {
    console.error("[Fitness] Error adding activity:", error)
    return null
  }
  
  // Check for badge unlocks
  const friendActivities = await getFitnessActivities(activity.friendId)
  const friendBadges = await getFitnessBadges(activity.friendId)
  const newBadges = checkBadgeUnlocks(activity.friendId, friendActivities, friendBadges)
  
  // Unlock new badges
  for (const badge of newBadges) {
    await unlockBadge(activity.friendId, badge.id)
  }
  
  return {
    id: data.id,
    friendId: data.friend_id,
    type: data.type,
    date: data.date,
    duration: data.duration,
    distance: data.distance,
    calories: data.calories,
    heartRate: data.heart_rate,
    points: data.points,
    source: data.source,
    stravaId: data.strava_id,
    notes: data.notes,
    createdAt: data.created_at
  }
}

// Get badges for a friend
export async function getFitnessBadges(friendId: string): Promise<FitnessBadge[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("fitness_badges")
    .select("*")
    .eq("friend_id", friendId)
    .order("unlocked_at", { ascending: false })
  
  if (error) {
    console.error("[Fitness] Error fetching badges:", error)
    return []
  }
  
  return (data || []).map(row => ({
    id: row.id,
    friendId: row.friend_id,
    badgeType: row.badge_type,
    unlockedAt: row.unlocked_at,
    metadata: row.metadata
  }))
}

// Unlock a badge for a friend
export async function unlockBadge(friendId: string, badgeType: string): Promise<FitnessBadge | null> {
  const supabase = createClient()
  
  // Check if badge already unlocked
  const existing = await getFitnessBadges(friendId)
  if (existing.some(b => b.badgeType === badgeType)) {
    return null
  }
  
  const { data, error } = await supabase
    .from("fitness_badges")
    .insert({
      friend_id: friendId,
      badge_type: badgeType,
      unlocked_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error("[Fitness] Error unlocking badge:", error)
    return null
  }
  
  return {
    id: data.id,
    friendId: data.friend_id,
    badgeType: data.badge_type,
    unlockedAt: data.unlocked_at,
    metadata: data.metadata
  }
}

// Get weekly leaderboard
export async function getWeeklyLeaderboard(friends: Friend[]): Promise<LeaderboardEntry[]> {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  const endDate = endOfWeek(new Date(), { weekStartsOn: 1 })
  
  const allActivities = await getFitnessActivities()
  const weekActivities = allActivities.filter(a => {
    const activityDate = new Date(a.date)
    return activityDate >= startDate && activityDate <= endDate
  })
  
  // Fetch all Strava connections
  const supabase = createClient()
  const { data: stravaConnections } = await supabase
    .from("strava_connections")
    .select("friend_id, athlete_id")
  
  const stravaMap = new Map(
    (stravaConnections || []).map(sc => [sc.friend_id, sc.athlete_id])
  )
  
  const leaderboard: LeaderboardEntry[] = []
  
  for (const friend of friends) {
    const friendActivities = weekActivities.filter(a => a.friendId === friend.id)
    const allFriendActivities = allActivities.filter(a => a.friendId === friend.id)
    const badges = await getFitnessBadges(friend.id)
    
    const totalPoints = friendActivities.reduce((sum, a) => sum + a.points, 0)
    const totalDistance = friendActivities
      .filter(a => a.distance)
      .reduce((sum, a) => sum + (a.distance || 0), 0)
    const totalCalories = friendActivities
      .filter(a => a.calories)
      .reduce((sum, a) => sum + (a.calories || 0), 0)
    const workoutCount = friendActivities.length
    const streak = calculateCurrentStreak(allFriendActivities)
    
    const athleteId = stravaMap.get(friend.id)
    
    leaderboard.push({
      friendId: friend.id,
      friendName: friend.name,
      friendImageUrl: friend.imageUrl,
      points: totalPoints,
      workouts: workoutCount,
      distance: totalDistance,
      calories: totalCalories,
      streak: streak,
      badges: badges.length,
      rank: 0, // Will be calculated below
      stravaAthleteId: athleteId,
      stravaConnected: !!athleteId
    })
  }
  
  // Sort by points and assign ranks
  leaderboard.sort((a, b) => b.points - a.points)
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1
  })
  
  return leaderboard
}

// Get week activity summary for a friend
export async function getWeekSummary(friendId: string) {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
  const endDate = endOfWeek(new Date(), { weekStartsOn: 1 })
  
  const allActivities = await getFitnessActivities(friendId)
  const weekActivities = allActivities.filter(a => {
    const activityDate = new Date(a.date)
    return activityDate >= startDate && activityDate <= endDate
  })
  
  const badges = await getFitnessBadges(friendId)
  const streak = calculateCurrentStreak(allActivities)
  
  // Build daily activity map (Mon-Sun)
  const dailyActivities: Record<string, FitnessActivity[]> = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateKey = format(date, 'yyyy-MM-dd')
    dailyActivities[dateKey] = weekActivities.filter(a => 
      format(new Date(a.date), 'yyyy-MM-dd') === dateKey
    )
  }
  
  return {
    totalPoints: weekActivities.reduce((sum, a) => sum + a.points, 0),
    totalWorkouts: weekActivities.length,
    totalDistance: weekActivities
      .filter(a => a.distance)
      .reduce((sum, a) => sum + (a.distance || 0), 0),
    totalCalories: weekActivities
      .filter(a => a.calories)
      .reduce((sum, a) => sum + (a.calories || 0), 0),
    streak: streak,
    badgesCount: badges.length,
    dailyActivities: dailyActivities
  }
}

// Get weekly challenges with current progress (accepts existing summary to avoid redundant queries)
export function getWeeklyChallenges(weekSummary: { totalPoints: number, totalWorkouts: number, totalDistance: number, totalCalories: number, streak: number }): WeeklyChallenge[] {
  
  // Define weekly challenges (these reset every week)
  const challengeDefinitions = [
    {
      id: "distance_20k",
      title: "Distance Warrior",
      description: "Run or bike 20km this week",
      emoji: "🏃",
      type: "distance" as const,
      target: 20,
      unit: "km",
      reward: "+100 bonus pts"
    },
    {
      id: "five_workouts",
      title: "Consistency King",
      description: "Complete 5 workouts this week",
      emoji: "💪",
      type: "workouts" as const,
      target: 5,
      unit: "workouts",
      reward: "+75 bonus pts"
    },
    {
      id: "points_300",
      title: "Point Hunter",
      description: "Earn 300 points this week",
      emoji: "⭐",
      type: "points" as const,
      target: 300,
      unit: "pts",
      reward: "+50 bonus pts"
    },
    {
      id: "calories_2000",
      title: "Calorie Crusher",
      description: "Burn 2,000 calories this week",
      emoji: "🔥",
      type: "calories" as const,
      target: 2000,
      unit: "cal",
      reward: "+80 bonus pts"
    },
    {
      id: "streak_7",
      title: "Perfect Week",
      description: "Workout 7 days in a row",
      emoji: "🎯",
      type: "streak" as const,
      target: 7,
      unit: "days",
      reward: "Special badge!"
    }
  ]
  
  return challengeDefinitions.map(def => {
    let current = 0
    switch (def.type) {
      case "distance":
        current = weekSummary.totalDistance
        break
      case "workouts":
        current = weekSummary.totalWorkouts
        break
      case "points":
        current = weekSummary.totalPoints
        break
      case "calories":
        current = weekSummary.totalCalories
        break
      case "streak":
        current = weekSummary.streak
        break
    }
    
    const progress = Math.min(100, Math.round((current / def.target) * 100))
    const completed = current >= def.target
    
    return {
      ...def,
      current,
      progress,
      completed
    }
  })
}

// Get recent activities across all friends (for activity feed)
export async function getRecentActivities(limit: number = 10): Promise<(FitnessActivity & { friendName: string; friendImageUrl: string })[]> {
  const supabase = createClient()
  
  const { data: activities, error: activitiesError } = await supabase
    .from("fitness_activities")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit)
  
  if (activitiesError) {
    console.error("[Fitness] Error fetching recent activities:", activitiesError)
    return []
  }
  
  const { data: friends, error: friendsError } = await supabase
    .from("friends")
    .select("id, name, image_url")
  
  if (friendsError) {
    console.error("[Fitness] Error fetching friends:", friendsError)
    return []
  }
  
  const friendMap = new Map(friends?.map(f => [f.id, { name: f.name, imageUrl: f.image_url }]) || [])
  
  return (activities || []).map(a => {
    const friend = friendMap.get(a.friend_id) || { name: 'Unknown', imageUrl: '' }
    return {
      id: a.id,
      friendId: a.friend_id,
      friendName: friend.name,
      friendImageUrl: friend.imageUrl,
      type: a.type,
      date: a.date,
      duration: a.duration,
      distance: a.distance,
      calories: a.calories,
      heartRate: a.heart_rate,
      points: a.points,
      source: a.source,
      stravaId: a.strava_id,
      notes: a.notes,
      createdAt: a.created_at
    }
  })
}

// Delete a fitness activity
export async function deleteFitnessActivity(activityId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("fitness_activities")
    .delete()
    .eq("id", activityId)
  
  if (error) {
    console.error("[Fitness] Error deleting activity:", error)
    return false
  }
  
  return true
}
