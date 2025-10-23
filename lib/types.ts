export interface Friend {
  id: string
  name: string
  email?: string // Email for trip notifications
  imageUrl: string
  groupIds: string[]
  isOwner?: boolean // Added isOwner field to identify portal owner
  quote?: string // Added quote field (max 35 characters)
  instagramHandle?: string // Added Instagram handle field
  // PIN is never included in client-side Friend objects for security
  // PINs are stored in database and validated server-side only
}

export interface Group {
  id: string
  name: string
  color: string
}

export interface Activity {
  id: string
  friendId: string // Keep for backward compatibility
  friendIds?: string[] // New field for multiple friends
  organizerId?: string // ID of the friend who organized this activity
  title: string
  startDate: string
  endDate: string
  type: "trip" | "activity"
  withWho?: string
  notes?: string
  linkedActivityId?: string // Link to another activity
  location?: string // Added location field for "activity" type
  startTime?: string // Added startTime field for "activity" type
  endTime?: string // Added endTime field for "activity" type
  budget?: number // Added budget field
  budgetBreakdown?: BudgetItem[] // Added budget breakdown field
  itinerary?: string // Added itinerary field
  isRecurring?: boolean // Added recurring activity fields
  recurrencePattern?: "daily" | "weekly" | "monthly"
  recurrenceEndDate?: string
}

export interface PendingRequest {
  id: string
  friendName: string
  activityTitle: string
  startDate: string
  endDate: string
  activityType: "activity" | "trip" // Updated activity types
  withWho?: string
  notes?: string
  submittedAt: string
}

export interface AppData {
  friends: Friend[]
  groups: Group[]
  activities: Activity[]
  pendingRequests?: PendingRequest[]
}

export interface PublicHoliday {
  date: string
  name: string
  extendedLeave?: {
    takeLeave: string[]
    totalDays: number
  }
}

export interface FeatureRequest {
  id: string
  title: string
  description: string
  status: "pending" | "deployed" | "rejected" // Added "rejected" status
  rejectionReason?: string // Added rejection reason field
  createdAt: string
  statusUpdatedAt?: string // Added status update timestamp
}

export interface BudgetItem {
  id: string
  category: string
  amount: number
}

export interface JoinRequest {
  id: string
  activityId: string
  friendId: string
  probability: "confirmed" | "maybe" | "unlikely"
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface BacklogItem {
  id: string
  title: string
  description: string
  detailedDescription?: string // Added detailedDescription for comprehensive explanations
  complexity: "Low" | "Medium" | "High"
  impact: "Low" | "Medium" | "High"
  category: string
  source: "ai" | "admin"
  status?: "not_started" | "in_progress" | "completed" // Added status field to track implementation progress
  createdAt: string
  votes?: number
  hasVoted?: boolean
}

export interface BacklogVote {
  id: string
  backlogItemId: string
  friendId: string
  createdAt: string
}

export interface BacklogComment {
  id: string
  backlogItemId: string
  friendId: string
  friendName?: string
  comment: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  actionType: "trip_created" | "trip_updated" | "trip_deleted" | "join_approved" | "join_rejected" | "friend_created" | "friend_updated" | "friend_deleted"
  activityId?: string
  activityTitle?: string
  activityType?: "trip" | "activity" // Type of activity (trip or activity)
  participantNames?: string // Comma-separated list of participant names
  location?: string // Location of the activity
  startDate?: string // Start date for context
  endDate?: string // End date for context
  friendId?: string
  friendName?: string
  details?: string
  createdAt: string
}

export interface CancelledOccurrence {
  id: string
  activityId: string
  cancelledDate: string
  cancelledBy?: string
  reason?: string
  createdAt: string
}

export interface ActivityComment {
  id: string
  activityId: string
  friendId: string
  friendName?: string
  friendImageUrl?: string
  comment: string
  taggedFriendIds: string[]
  taggedFriendNames?: string[]
  activityTitle?: string
  activityStartDate?: string
  activityEndDate?: string
  createdAt: string
}

export interface ActivityReaction {
  id: string
  activityId: string
  friendId: string
  friendName?: string
  reactionType: "like" | "love" | "laugh" | "wow" | "sad"
  createdAt: string
}

// Fitness tracking types
export interface FitnessActivity {
  id: string
  friendId: string
  type: "run" | "bike" | "swim" | "gym" | "yoga" | "walk" | "hike" | "other"
  date: string
  duration: number // minutes
  distance?: number // km (optional for strength training)
  calories?: number
  heartRate?: number
  points: number
  source: "manual" | "strava" | "apple_health"
  stravaId?: string
  notes?: string
  createdAt: string
}

export interface FitnessBadge {
  id: string
  friendId: string
  badgeType: string // e.g., 'first_steps', 'marathon_runner', 'hot_streak'
  unlockedAt: string
  metadata?: {
    distance?: number
    streakDays?: number
    workoutCount?: number
    [key: string]: any
  }
}

export interface SquadChallenge {
  id: string
  title: string
  description?: string
  type: "distance" | "workout_count" | "streak" | "points"
  target: number
  startDate: string
  endDate: string
  participants: string[] // Array of friend IDs
  isActive: boolean
  createdBy?: string
  createdAt: string
}

export interface FitnessStats {
  id: string
  friendId: string
  period: "week" | "month" | "year"
  startDate: string
  totalPoints: number
  totalDistance: number
  totalWorkouts: number
  longestStreak: number
  badgesCount: number
  updatedAt: string
}

export interface LeaderboardEntry {
  friendId: string
  friendName: string
  friendImageUrl: string
  points: number
  workouts: number
  distance: number
  calories: number
  streak: number
  badges: number
  rank: number
  stravaAthleteId?: string // Strava athlete ID if connected
  stravaConnected: boolean // Whether they have Strava linked
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  category: "cardio" | "strength" | "streak" | "special"
  condition: (activities: FitnessActivity[], badges: FitnessBadge[]) => boolean
}

export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  emoji: string
  type: "distance" | "workouts" | "points" | "calories" | "streak"
  target: number
  current: number
  unit: string // "km", "workouts", "pts", "cal", "days"
  progress: number // 0-100 percentage
  completed: boolean
  reward: string // e.g., "+50 bonus pts", "Special badge"
}
