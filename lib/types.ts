export interface Friend {
  id: string
  name: string
  imageUrl: string
  groupIds: string[]
  isOwner?: boolean // Added isOwner field to identify portal owner
  quote?: string // Added quote field (max 35 characters)
  instagramHandle?: string // Added Instagram handle field
  pin?: string // Personal PIN for authentication (default: 2468)
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
  actionType: "trip_created" | "trip_updated" | "trip_deleted" | "join_approved" | "join_rejected"
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
