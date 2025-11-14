import { createClient } from "@/lib/supabase/server"
import type {
  FitnessEvent,
  FitnessEventParticipant,
  FitnessEventWithDetails,
  Activity,
} from "./types"

export async function createFitnessEvent(
  activityId: string,
  eventData: Omit<FitnessEvent, "id" | "activityId" | "createdAt" | "updatedAt">
): Promise<FitnessEvent | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("fitness_events")
    .insert({
      activity_id: activityId,
      event_category: eventData.eventCategory,
      intensity_level: eventData.intensityLevel,
      meetup_location: eventData.meetupLocation,
      meetup_lat: eventData.meetupLat,
      meetup_lng: eventData.meetupLng,
      meetup_notes: eventData.meetupNotes,
      route_source: eventData.routeSource,
      route_external_id: eventData.routeExternalId,
      route_snapshot: eventData.routeSnapshot,
      gear_checklist: eventData.gearChecklist,
      logistics_notes: eventData.logisticsNotes,
      auto_log_workouts: eventData.autoLogWorkouts,
      points_override: eventData.pointsOverride,
    })
    .select()
    .single()
  
  if (error) {
    console.error("[FitnessEvents] Error creating event:", error)
    return null
  }
  
  return mapDbToFitnessEvent(data)
}

export async function updateFitnessEvent(
  eventId: string,
  updates: Partial<Omit<FitnessEvent, "id" | "activityId" | "createdAt" | "updatedAt">>
): Promise<FitnessEvent | null> {
  const supabase = await createClient()
  
  const dbUpdates: any = {}
  if (updates.eventCategory) dbUpdates.event_category = updates.eventCategory
  if (updates.intensityLevel !== undefined) dbUpdates.intensity_level = updates.intensityLevel
  if (updates.meetupLocation !== undefined) dbUpdates.meetup_location = updates.meetupLocation
  if (updates.meetupLat !== undefined) dbUpdates.meetup_lat = updates.meetupLat
  if (updates.meetupLng !== undefined) dbUpdates.meetup_lng = updates.meetupLng
  if (updates.meetupNotes !== undefined) dbUpdates.meetup_notes = updates.meetupNotes
  if (updates.routeSource !== undefined) dbUpdates.route_source = updates.routeSource
  if (updates.routeExternalId !== undefined) dbUpdates.route_external_id = updates.routeExternalId
  if (updates.routeSnapshot !== undefined) dbUpdates.route_snapshot = updates.routeSnapshot
  if (updates.gearChecklist !== undefined) dbUpdates.gear_checklist = updates.gearChecklist
  if (updates.logisticsNotes !== undefined) dbUpdates.logistics_notes = updates.logisticsNotes
  if (updates.autoLogWorkouts !== undefined) dbUpdates.auto_log_workouts = updates.autoLogWorkouts
  if (updates.pointsOverride !== undefined) dbUpdates.points_override = updates.pointsOverride
  
  const { data, error } = await supabase
    .from("fitness_events")
    .update(dbUpdates)
    .eq("id", eventId)
    .select()
    .single()
  
  if (error) {
    console.error("[FitnessEvents] Error updating event:", error)
    return null
  }
  
  return mapDbToFitnessEvent(data)
}

export async function getFitnessEventByActivityId(activityId: string): Promise<FitnessEvent | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("fitness_events")
    .select("*")
    .eq("activity_id", activityId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return mapDbToFitnessEvent(data)
}

export async function getFitnessEventById(eventId: string): Promise<FitnessEvent | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("fitness_events")
    .select("*")
    .eq("id", eventId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return mapDbToFitnessEvent(data)
}

export async function getFitnessEventWithDetails(eventId: string): Promise<FitnessEventWithDetails | null> {
  const supabase = await createClient()
  
  // Fetch event
  const eventData = await getFitnessEventById(eventId)
  if (!eventData) return null
  
  // Fetch activity
  const { data: activityData, error: activityError } = await supabase
    .from("activities")
    .select("*")
    .eq("id", eventData.activityId)
    .single()
  
  if (activityError || !activityData) {
    console.error("[FitnessEvents] Error fetching activity:", activityError)
    return null
  }
  
  // Fetch participants
  const participants = await getFitnessEventParticipants(eventId)
  
  const goingCount = participants.filter(p => p.rsvpStatus === "going").length
  const maybeCount = participants.filter(p => p.rsvpStatus === "maybe").length
  const checkedInCount = participants.filter(p => p.attendanceStatus === "checked_in").length
  
  return {
    ...eventData,
    activity: mapDbToActivity(activityData),
    participants,
    goingCount,
    maybeCount,
    checkedInCount,
  }
}

export async function getFitnessEventParticipants(eventId: string): Promise<FitnessEventParticipant[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("fitness_event_participants")
    .select(`
      *,
      friends:friend_id (
        name,
        image_url
      )
    `)
    .eq("event_id", eventId)
  
  if (error || !data) {
    console.error("[FitnessEvents] Error fetching participants:", error)
    return []
  }
  
  return data.map((p: any) => ({
    id: p.id,
    eventId: p.event_id,
    friendId: p.friend_id,
    friendName: p.friends?.name,
    friendImageUrl: p.friends?.image_url,
    rsvpStatus: p.rsvp_status,
    attendanceStatus: p.attendance_status,
    checkedInAt: p.checked_in_at,
    fitnessActivityId: p.fitness_activity_id,
    bonusPointsAwarded: p.bonus_points_awarded || 0,
    notes: p.notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }))
}

export async function addFitnessEventParticipant(
  eventId: string,
  friendId: string,
  rsvpStatus: FitnessEventParticipant["rsvpStatus"] = "invited"
): Promise<FitnessEventParticipant | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("fitness_event_participants")
    .insert({
      event_id: eventId,
      friend_id: friendId,
      rsvp_status: rsvpStatus,
      attendance_status: "pending",
      bonus_points_awarded: 0,
    })
    .select()
    .single()
  
  if (error) {
    console.error("[FitnessEvents] Error adding participant:", error)
    return null
  }
  
  return mapDbToParticipant(data)
}

export async function updateParticipantRsvp(
  eventId: string,
  friendId: string,
  rsvpStatus: FitnessEventParticipant["rsvpStatus"]
): Promise<boolean> {
  const supabase = await createClient()
  
  // FIX: Check if row exists by returning the data
  const { data, error } = await supabase
    .from("fitness_event_participants")
    .update({ rsvp_status: rsvpStatus })
    .eq("event_id", eventId)
    .eq("friend_id", friendId)
    .select()
  
  if (error) {
    console.error("[FitnessEvents] Error updating RSVP:", error)
    return false
  }
  
  // FIX: Return false if no rows were updated (participant doesn't exist)
  return data && data.length > 0
}

export async function checkInParticipant(
  eventId: string,
  friendId: string,
  attendanceStatus: FitnessEventParticipant["attendanceStatus"] = "checked_in"
): Promise<boolean> {
  const supabase = await createClient()
  
  // FIX: Support all attendance statuses including "no_show"
  const updateData: any = {
    attendance_status: attendanceStatus,
  }
  
  // Only set checked_in_at for actual check-ins
  if (attendanceStatus === "checked_in") {
    updateData.checked_in_at = new Date().toISOString()
  }
  
  // FIX: Return data to verify row was updated
  const { data, error } = await supabase
    .from("fitness_event_participants")
    .update(updateData)
    .eq("event_id", eventId)
    .eq("friend_id", friendId)
    .select()
  
  if (error) {
    console.error("[FitnessEvents] Error updating attendance:", error)
    return false
  }
  
  // Verify a row was actually updated
  return data && data.length > 0
}

export async function linkWorkoutToEvent(
  eventId: string,
  friendId: string,
  fitnessActivityId: string,
  bonusPoints: number
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("fitness_event_participants")
    .update({
      fitness_activity_id: fitnessActivityId,
      bonus_points_awarded: bonusPoints,
    })
    .eq("event_id", eventId)
    .eq("friend_id", friendId)
  
  if (error) {
    console.error("[FitnessEvents] Error linking workout:", error)
    return false
  }
  
  return true
}

export async function getUpcomingFitnessEvents(limit = 10): Promise<FitnessEventWithDetails[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from("fitness_events")
    .select(`
      *,
      activities!inner (*)
    `)
    .gte("activities.start_date", today)
    .order("activities.start_date", { ascending: true })
    .limit(limit)
  
  if (error || !data) {
    console.error("[FitnessEvents] Error fetching upcoming events:", error)
    return []
  }
  
  const eventsWithDetails = await Promise.all(
    data.map(async (item: any) => {
      const participants = await getFitnessEventParticipants(item.id)
      const goingCount = participants.filter(p => p.rsvpStatus === "going").length
      const maybeCount = participants.filter(p => p.rsvpStatus === "maybe").length
      const checkedInCount = participants.filter(p => p.attendanceStatus === "checked_in").length
      
      return {
        ...mapDbToFitnessEvent(item),
        activity: mapDbToActivity(item.activities),
        participants,
        goingCount,
        maybeCount,
        checkedInCount,
      }
    })
  )
  
  return eventsWithDetails
}

function mapDbToFitnessEvent(data: any): FitnessEvent {
  return {
    id: data.id,
    activityId: data.activity_id,
    eventCategory: data.event_category,
    intensityLevel: data.intensity_level,
    meetupLocation: data.meetup_location,
    meetupLat: data.meetup_lat,
    meetupLng: data.meetup_lng,
    meetupNotes: data.meetup_notes,
    routeSource: data.route_source,
    routeExternalId: data.route_external_id,
    routeSnapshot: data.route_snapshot,
    gearChecklist: data.gear_checklist,
    logisticsNotes: data.logistics_notes,
    autoLogWorkouts: data.auto_log_workouts,
    pointsOverride: data.points_override,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapDbToParticipant(data: any): FitnessEventParticipant {
  return {
    id: data.id,
    eventId: data.event_id,
    friendId: data.friend_id,
    rsvpStatus: data.rsvp_status,
    attendanceStatus: data.attendance_status,
    checkedInAt: data.checked_in_at,
    fitnessActivityId: data.fitness_activity_id,
    bonusPointsAwarded: data.bonus_points_awarded || 0,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapDbToActivity(data: any): Activity {
  return {
    id: data.id,
    friendId: data.friend_id,
    friendIds: data.friend_ids || [data.friend_id],
    organizerId: data.organizer_id,
    title: data.title,
    startDate: data.start_date,
    endDate: data.end_date,
    type: data.type,
    withWho: data.with_who,
    notes: data.notes,
    linkedActivityId: data.linked_activity_id,
    location: data.location,
    startTime: data.start_time,
    endTime: data.end_time,
    budget: data.budget,
    budgetBreakdown: data.budget_breakdown,
    itinerary: data.itinerary,
    isRecurring: data.is_recurring,
    recurrencePattern: data.recurrence_pattern,
    recurrenceEndDate: data.recurrence_end_date,
    isFitnessEvent: data.is_fitness_event,
  }
}
