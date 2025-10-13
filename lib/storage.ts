import { createClient } from "@/lib/supabase/client"
import type {
  AppData,
  Friend,
  Group,
  Activity,
  PendingRequest,
  FeatureRequest,
  JoinRequest,
  BacklogItem,
  BacklogComment,
  ActivityLog,
  CancelledOccurrence,
  ActivityComment,
  ActivityReaction,
} from "./types"

// Friend authentication functions
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return !!sessionStorage.getItem("logged-in-role")
}

export const getLoggedInFriendId = (): string | null => {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem("logged-in-friend-id")
}

export const getLoggedInFriendName = (): string | null => {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem("logged-in-friend-name")
}

export const getLoggedInRole = (): "superadmin" | "friend" | null => {
  if (typeof window === "undefined") return null
  const role = sessionStorage.getItem("logged-in-role")
  return role as "superadmin" | "friend" | null
}

export const isSuperAdmin = (): boolean => {
  return getLoggedInRole() === "superadmin"
}

export const setFriendLogin = (role: "superadmin" | "friend", friendId: string | null, friendName: string): void => {
  if (typeof window === "undefined") return
  sessionStorage.setItem("logged-in-role", role)
  sessionStorage.setItem("logged-in-friend-id", friendId || "")
  sessionStorage.setItem("logged-in-friend-name", friendName)
}

export const setFriendLogout = (): void => {
  if (typeof window === "undefined") return
  sessionStorage.removeItem("logged-in-role")
  sessionStorage.removeItem("logged-in-friend-id")
  sessionStorage.removeItem("logged-in-friend-name")
}

export const getStoredData = async (): Promise<AppData> => {
  const supabase = createClient()

  const [friendsRes, groupsRes, activitiesRes, requestsRes, participantsRes] = await Promise.all([
    supabase.from("friends").select("*").order("name"),
    supabase.from("groups").select("*").order("name"),
    supabase.from("activities").select("*").order("start_date"),
    supabase.from("friend_requests").select("*").eq("status", "pending").order("created_at"),
    supabase.from("activity_participants").select("*"),
  ])

  const friends: Friend[] =
    friendsRes.data?.map((f) => ({
      id: f.id,
      name: f.name,
      imageUrl: f.image_url || "",
      groupIds: f.group_id ? [f.group_id] : [],
      isOwner: f.is_owner || false, // Added isOwner field from database
      quote: f.quote || undefined, // Added quote field to Friend mapping
      instagramHandle: f.instagram_handle || undefined, // Added instagram_handle mapping from database
      pin: f.pin || "2468", // Personal PIN for authentication, default 2468
    })) || []

  const groups: Group[] =
    groupsRes.data?.map((g) => ({
      id: g.id,
      name: g.name,
      color: g.color,
    })) || []

  const activities: Activity[] =
    activitiesRes.data?.map((a) => {
      const participants = participantsRes.data?.filter((p) => p.activity_id === a.id) || []
      const friendIds = participants.map((p) => p.friend_id)

      return {
        id: a.id,
        friendId: a.friend_id,
        friendIds: friendIds.length > 0 ? friendIds : [a.friend_id],
        title: a.title,
        startDate: a.start_date,
        endDate: a.end_date,
        type: a.type as "trip" | "activity",
        withWho: a.with_who,
        notes: a.notes,
        linkedActivityId: a.linked_activity_id,
        location: a.location,
        startTime: a.start_time,
        endTime: a.end_time,
        budget: a.budget,
        itinerary: a.itinerary,
        organizerId: a.organizer_id,
        isRecurring: a.is_recurring,
        recurrencePattern: a.recurrence_pattern,
        recurrenceEndDate: a.recurrence_end_date,
        budgetBreakdown: a.budget_breakdown,
      }
    }) || []

  const pendingRequests: PendingRequest[] =
    requestsRes.data?.map((r) => ({
      id: r.id,
      friendName: r.friend_name,
      activityTitle: r.activity_title,
      startDate: r.start_date,
      endDate: r.end_date,
      activityType: r.activity_type,
      withWho: r.with_who,
      notes: r.notes,
      submittedAt: r.created_at,
    })) || []

  return { friends, groups, activities, pendingRequests }
}

export const saveFriend = async (friend: Omit<Friend, "id"> & { id?: string }): Promise<string> => {
  const supabase = createClient()

  const dbFriend = {
    name: friend.name,
    image_url: friend.imageUrl,
    group_id: friend.groupIds[0] || null,
    is_owner: friend.isOwner || false, // Save isOwner field to database
    quote: friend.quote || null, // Added quote field to database save
    instagram_handle: friend.instagramHandle || null, // Added instagram_handle to database save
    pin: friend.pin || "2468", // Save personal PIN, default to 2468
  }

  if (friend.id) {
    await supabase.from("friends").update(dbFriend).eq("id", friend.id)
    return friend.id
  } else {
    const { data, error } = await supabase.from("friends").insert(dbFriend).select().single()
    if (error) throw error
    return data.id
  }
}

export const deleteFriend = async (id: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("friends").delete().eq("id", id)
}

export const saveGroup = async (group: Omit<Group, "id"> & { id?: string }): Promise<void> => {
  const supabase = createClient()

  if (group.id) {
    await supabase.from("groups").update({ name: group.name, color: group.color }).eq("id", group.id)
  } else {
    await supabase.from("groups").insert({ name: group.name, color: group.color })
  }
}

export const deleteGroup = async (id: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("groups").delete().eq("id", id)
}

export const saveActivity = async (activity: Omit<Activity, "id"> & { id?: string }): Promise<string> => {
  const supabase = createClient()

  const dbActivity = {
    friend_id: activity.friendId || (activity.friendIds && activity.friendIds[0]) || "",
    organizer_id: activity.organizerId,
    title: activity.title,
    start_date: activity.startDate,
    end_date: activity.endDate,
    type: activity.type,
    with_who: activity.withWho,
    notes: activity.notes,
    linked_activity_id: activity.linkedActivityId,
    location: activity.location,
    start_time: activity.startTime,
    end_time: activity.endTime,
    budget: activity.budget,
    itinerary: activity.itinerary,
    is_recurring: activity.isRecurring,
    recurrence_pattern: activity.recurrencePattern,
    recurrence_end_date: activity.recurrenceEndDate,
    budget_breakdown: activity.budgetBreakdown,
  }

  let activityId = activity.id

  if (activity.id) {
    await supabase.from("activities").update(dbActivity).eq("id", activity.id)
    await supabase.from("activity_participants").delete().eq("activity_id", activity.id)
  } else {
    const { data, error } = await supabase.from("activities").insert(dbActivity).select().single()
    if (error) {
      console.error("[v0] Error inserting activity:", error)
      throw error
    }
    activityId = data?.id
  }

  if (activityId && activity.friendIds && activity.friendIds.length > 0) {
    const participants = activity.friendIds.map((friendId) => ({
      activity_id: activityId,
      friend_id: friendId,
    }))
    await supabase.from("activity_participants").insert(participants)
  }

  return activityId || ""
}

export const deleteActivity = async (id: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("activities").delete().eq("id", id)
}

export const submitFriendRequest = async (request: Omit<PendingRequest, "id" | "submittedAt">): Promise<void> => {
  const supabase = createClient()

  console.log("[v0] Submitting friend request:", request)

  const { data, error } = await supabase
    .from("friend_requests")
    .insert({
      friend_name: request.friendName,
      activity_title: request.activityTitle,
      start_date: request.startDate,
      end_date: request.endDate,
      activity_type: request.activityType,
      with_who: request.withWho,
      notes: request.notes,
      status: "pending",
    })
    .select()

  if (error) {
    console.error("[v0] Error submitting friend request:", error.message)
    throw error
  }

  console.log("[v0] Friend request submitted successfully:", data)
}

export const approveFriendRequest = async (requestId: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("friend_requests").update({ status: "approved" }).eq("id", requestId)
}

export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("friend_requests").update({ status: "rejected" }).eq("id", requestId)
}

export const getFeatureRequests = async (): Promise<FeatureRequest[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from("feature_requests").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching feature requests:", error)
    return []
  }

  return (
    data?.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status as "pending" | "deployed" | "rejected", // Added "rejected" status
      rejectionReason: r.rejection_reason, // Added rejection reason
      createdAt: r.created_at,
      statusUpdatedAt: r.status_updated_at, // Added status update timestamp
    })) || []
  )
}

export const submitFeatureRequest = async (
  request: Omit<FeatureRequest, "id" | "createdAt" | "status">,
): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("feature_requests").insert({
    title: request.title,
    description: request.description,
    status: "pending",
  })

  if (error) {
    console.error("[v0] Error submitting feature request:", error)
    throw error
  }
}

export const updateFeatureRequestStatus = async (
  id: string,
  status: "pending" | "deployed" | "rejected",
  rejectionReason?: string,
): Promise<void> => {
  const supabase = createClient()
  console.log("[v0] Updating feature request in database:", { id, status, rejectionReason })

  const { data, error } = await supabase
    .from("feature_requests")
    .update({
      status,
      rejection_reason: rejectionReason || null,
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("[v0] Error updating feature request:", error)
    throw error
  }

  console.log("[v0] Feature request updated successfully:", data)
}

export const submitJoinRequest = async (
  activityId: string,
  friendId: string,
  probability: "confirmed" | "maybe" | "unlikely",
): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("join_requests").insert({
    activity_id: activityId,
    friend_id: friendId,
    probability,
    status: "pending",
  })

  if (error) {
    console.error("[v0] Error submitting join request:", error)
    throw error
  }
}

export const getJoinRequests = async (): Promise<JoinRequest[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("join_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching join requests:", error)
    return []
  }

  return (
    data?.map((r) => ({
      id: r.id,
      activityId: r.activity_id,
      friendId: r.friend_id,
      probability: r.probability as "confirmed" | "maybe" | "unlikely",
      status: r.status as "pending" | "approved" | "rejected",
      createdAt: r.created_at,
    })) || []
  )
}

export const approveJoinRequest = async (requestId: string, activityId: string, friendId: string): Promise<void> => {
  const supabase = createClient()

  // Update request status
  await supabase.from("join_requests").update({ status: "approved" }).eq("id", requestId)

  // Add friend to activity participants
  await supabase.from("activity_participants").insert({
    activity_id: activityId,
    friend_id: friendId,
  })
}

export const rejectJoinRequest = async (requestId: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("join_requests").update({ status: "rejected" }).eq("id", requestId)
}

export const checkActivityOverlap = async (
  friendId: string,
  startDate: string,
  endDate: string,
): Promise<Activity[]> => {
  const supabase = createClient()

  // Get all activities for this friend
  const { data: participantsData } = await supabase
    .from("activity_participants")
    .select("activity_id")
    .eq("friend_id", friendId)

  const activityIds = participantsData?.map((p) => p.activity_id) || []

  if (activityIds.length === 0) return []

  // Get activities that overlap with the date range
  const { data: activitiesData } = await supabase
    .from("activities")
    .select("*")
    .in("id", activityIds)
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

  return (
    activitiesData?.map((a) => ({
      id: a.id,
      friendId: a.friend_id,
      friendIds: [a.friend_id],
      title: a.title,
      startDate: a.start_date,
      endDate: a.end_date,
      type: a.type as "trip" | "activity",
      withWho: a.with_who,
      notes: a.notes,
      linkedActivityId: a.linked_activity_id,
      location: a.location,
      startTime: a.start_time,
      endTime: a.end_time,
      budget: a.budget,
      itinerary: a.itinerary,
      organizerId: a.organizer_id,
      isRecurring: a.is_recurring,
      recurrencePattern: a.recurrence_pattern,
      recurrenceEndDate: a.recurrence_end_date,
      budgetBreakdown: a.budget_breakdown,
    })) || []
  )
}

export const getFriends = async (): Promise<Friend[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from("friends").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching friends:", error)
    return []
  }

  return (
    data?.map((f) => ({
      id: f.id,
      name: f.name,
      imageUrl: f.image_url || "",
      groupIds: f.group_id ? [f.group_id] : [],
      isOwner: f.is_owner || false,
      quote: f.quote || undefined,
      instagramHandle: f.instagram_handle || undefined, // Added instagram_handle mapping from database
    })) || []
  )
}

export const getBacklogItems = async (friendId?: string): Promise<BacklogItem[]> => {
  const supabase = createClient()

  const { data: itemsData, error: itemsError } = await supabase
    .from("backlog_items")
    .select("*")
    .order("created_at", { ascending: false })

  if (itemsError) {
    console.error("[v0] Error fetching backlog items:", itemsError)
    return []
  }

  const { data: votesData } = await supabase.from("backlog_votes").select("backlog_item_id, friend_id")

  const items: BacklogItem[] =
    itemsData?.map((item) => {
      const itemVotes = votesData?.filter((v) => v.backlog_item_id === item.id) || []
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        complexity: item.complexity as "Low" | "Medium" | "High",
        impact: item.impact as "Low" | "Medium" | "High",
        category: item.category,
        source: item.source as "ai" | "admin",
        createdAt: item.created_at,
        votes: itemVotes.length,
        hasVoted: friendId ? itemVotes.some((v) => v.friend_id === friendId) : false,
      }
    }) || []

  return items
}

export const createBacklogItem = async (
  item: Omit<BacklogItem, "id" | "createdAt" | "votes" | "hasVoted">,
): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("backlog_items").insert({
    title: item.title,
    description: item.description,
    complexity: item.complexity,
    impact: item.impact,
    category: item.category,
    source: item.source,
  })

  if (error) {
    console.error("[v0] Error saving backlog item:", error)
    throw error
  }
}

export const deleteBacklogItem = async (id: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("backlog_items").delete().eq("id", id)
}

export const voteBacklogItem = async (itemId: string, friendId: string): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("backlog_votes").insert({
    backlog_item_id: itemId,
    friend_id: friendId,
  })

  if (error) {
    console.error("[v0] Error voting on backlog item:", error)
    throw error
  }
}

export const unvoteBacklogItem = async (itemId: string, friendId: string): Promise<void> => {
  const supabase = createClient()

  await supabase.from("backlog_votes").delete().eq("backlog_item_id", itemId).eq("friend_id", friendId)
}

export const getBacklogComments = async (itemId: string): Promise<BacklogComment[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("backlog_comments")
    .select(`
      id,
      backlog_item_id,
      friend_id,
      comment,
      created_at,
      friends (
        name
      )
    `)
    .eq("backlog_item_id", itemId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching backlog comments:", error)
    return []
  }

  return (
    data?.map((c) => ({
      id: c.id,
      backlogItemId: c.backlog_item_id,
      friendId: c.friend_id,
      friendName: (c.friends as any)?.name || "Unknown",
      comment: c.comment,
      createdAt: c.created_at,
    })) || []
  )
}

export const addBacklogComment = async (itemId: string, friendId: string, comment: string): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("backlog_comments").insert({
    backlog_item_id: itemId,
    friend_id: friendId,
    comment,
  })

  if (error) {
    console.error("[v0] Error adding backlog comment:", error)
    throw error
  }
}

export const deleteBacklogComment = async (commentId: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("backlog_comments").delete().eq("id", commentId)
}

export const logActivity = async (
  actionType: "trip_created" | "trip_updated" | "trip_deleted" | "join_approved" | "join_rejected" | "friend_created" | "friend_updated" | "friend_deleted",
  activityId?: string,
  activityTitle?: string,
  activityType?: "trip" | "activity",
  participantNames?: string,
  location?: string,
  startDate?: string,
  endDate?: string,
  organizerName?: string,
): Promise<void> => {
  const supabase = createClient()

  console.log("[v0] logActivity called with:", {
    actionType,
    activityId,
    activityTitle,
    activityType,
    participantNames,
    location,
    startDate,
    endDate,
    organizerName,
  })

  const { data, error } = await supabase
    .from("activity_log")
    .insert({
      action_type: actionType,
      activity_id: activityId || null,
      activity_title: activityTitle || null,
      activity_type: activityType || null,
      participant_names: participantNames || null,
      location: location || null,
      start_date: startDate || null,
      end_date: endDate || null,
      friend_name: organizerName || null,
    })
    .select()

  if (error) {
    console.error("[v0] Error logging activity:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
  } else {
    console.log("[v0] Activity log inserted successfully:", data)
  }
}

export const getActivityLogs = async (limit?: number): Promise<ActivityLog[]> => {
  const supabase = createClient()

  let query = supabase.from("activity_log").select("*").order("created_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching activity logs:", error)
    return []
  }

  return (
    data?.map((log) => ({
      id: log.id,
      actionType: log.action_type as
        | "trip_created"
        | "trip_updated"
        | "trip_deleted"
        | "join_approved"
        | "join_rejected"
        | "friend_created"
        | "friend_updated"
        | "friend_deleted",
      activityId: log.activity_id,
      activityTitle: log.activity_title,
      activityType: log.activity_type,
      participantNames: log.participant_names,
      location: log.location,
      startDate: log.start_date,
      endDate: log.end_date,
      friendId: log.friend_id,
      friendName: log.friend_name,
      details: log.details,
      createdAt: log.created_at,
    })) || []
  )
}

export const getPublicActivityLogs = async (limit = 20): Promise<ActivityLog[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .in("action_type", ["trip_created", "trip_updated", "trip_deleted"])
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching public activity logs:", error)
    return []
  }

  return (
    data?.map((log) => ({
      id: log.id,
      actionType: log.action_type as "trip_created" | "trip_updated" | "trip_deleted",
      activityId: log.activity_id,
      activityTitle: log.activity_title,
      activityType: log.activity_type,
      participantNames: log.participant_names,
      location: log.location,
      startDate: log.start_date,
      endDate: log.end_date,
      friendName: log.friend_name,
      createdAt: log.created_at,
    })) || []
  )
}

export const cancelRecurringOccurrence = async (
  activityId: string,
  cancelledDate: string,
  cancelledBy?: string,
  reason?: string,
): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("cancelled_occurrences").insert({
    activity_id: activityId,
    cancelled_date: cancelledDate,
    cancelled_by: cancelledBy,
    reason,
  })

  if (error) {
    console.error("[v0] Error cancelling occurrence:", error)
    throw error
  }
}

export const getCancelledOccurrences = async (activityId: string): Promise<CancelledOccurrence[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("cancelled_occurrences")
    .select("*")
    .eq("activity_id", activityId)
    .order("cancelled_date")

  if (error) {
    console.error("[v0] Error fetching cancelled occurrences:", error)
    return []
  }

  return (
    data?.map((c) => ({
      id: c.id,
      activityId: c.activity_id,
      cancelledDate: c.cancelled_date,
      cancelledBy: c.cancelled_by,
      reason: c.reason,
      createdAt: c.created_at,
    })) || []
  )
}

export const getActivityComments = async (activityId: string): Promise<ActivityComment[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("activity_comments")
    .select(`
      id,
      activity_id,
      friend_id,
      comment,
      tagged_friend_ids,
      created_at,
      friends (
        name,
        image_url
      )
    `)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching activity comments:", error)
    return []
  }

  // Get tagged friend names
  const allTaggedIds = [...new Set(data?.flatMap((c) => c.tagged_friend_ids || []) || [])]
  const { data: taggedFriendsData } = await supabase.from("friends").select("id, name").in("id", allTaggedIds)

  return (
    data?.map((c) => {
      const taggedNames =
        c.tagged_friend_ids?.map((id: string) => taggedFriendsData?.find((f) => f.id === id)?.name || "Unknown") || []

      return {
        id: c.id,
        activityId: c.activity_id,
        friendId: c.friend_id,
        friendName: (c.friends as any)?.name || "Unknown",
        friendImageUrl: (c.friends as any)?.image_url || "",
        comment: c.comment,
        taggedFriendIds: c.tagged_friend_ids || [],
        taggedFriendNames: taggedNames,
        createdAt: c.created_at,
      }
    }) || []
  )
}

export const addActivityComment = async (
  activityId: string,
  friendId: string,
  comment: string,
  taggedFriendIds: string[] = [],
): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("activity_comments").insert({
    activity_id: activityId,
    friend_id: friendId,
    comment,
    tagged_friend_ids: taggedFriendIds,
  })

  if (error) {
    console.error("[v0] Error adding activity comment:", error)
    throw error
  }
}

export const deleteActivityComment = async (commentId: string): Promise<void> => {
  const supabase = createClient()
  await supabase.from("activity_comments").delete().eq("id", commentId)
}

export const getActivityReactions = async (activityId: string): Promise<ActivityReaction[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("activity_reactions")
    .select(`
      id,
      activity_id,
      friend_id,
      reaction_type,
      created_at,
      friends (
        name
      )
    `)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching activity reactions:", error)
    return []
  }

  return (
    data?.map((r) => ({
      id: r.id,
      activityId: r.activity_id,
      friendId: r.friend_id,
      friendName: (r.friends as any)?.name || "Unknown",
      reactionType: r.reaction_type as "like" | "love" | "laugh" | "wow" | "sad",
      createdAt: r.created_at,
    })) || []
  )
}

export const addActivityReaction = async (
  activityId: string,
  friendId: string,
  reactionType: "like" | "love" | "laugh" | "wow" | "sad",
): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from("activity_reactions").insert({
    activity_id: activityId,
    friend_id: friendId,
    reaction_type: reactionType,
  })

  if (error) {
    console.error("[v0] Error adding activity reaction:", error)
    throw error
  }
}

export const removeActivityReaction = async (
  activityId: string,
  friendId: string,
  reactionType: string,
): Promise<void> => {
  const supabase = createClient()

  await supabase
    .from("activity_reactions")
    .delete()
    .eq("activity_id", activityId)
    .eq("friend_id", friendId)
    .eq("reaction_type", reactionType)
}

export const getTaggedComments = async (friendId: string): Promise<ActivityComment[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("activity_comments")
    .select(`
      id,
      activity_id,
      friend_id,
      comment,
      tagged_friend_ids,
      created_at,
      friends (
        name,
        image_url
      ),
      activities (
        title,
        start_date,
        end_date
      )
    `)
    .contains("tagged_friend_ids", [friendId])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching tagged comments:", error)
    return []
  }

  return (
    data?.map((c) => ({
      id: c.id,
      activityId: c.activity_id,
      friendId: c.friend_id,
      friendName: (c.friends as any)?.name || "Unknown",
      friendImageUrl: (c.friends as any)?.image_url || "",
      comment: c.comment,
      taggedFriendIds: c.tagged_friend_ids || [],
      activityTitle: (c.activities as any)?.title,
      activityStartDate: (c.activities as any)?.start_date,
      activityEndDate: (c.activities as any)?.end_date,
      createdAt: c.created_at,
    })) || []
  )
}
