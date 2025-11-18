import { NextRequest, NextResponse } from "next/server"
import { getFitnessEventWithDetails, updateFitnessEvent, getFitnessEventById } from "@/lib/fitness-events-storage"
import { requireAuth, canModifyEvent, UnauthorizedError } from "@/lib/server-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    
    const event = await getFitnessEventWithDetails(params.id)
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }
    
    // Check if user can access this event (organizer or superadmin)
    const canModify = await canModifyEvent(auth, event.activity.id)
    if (!canModify) {
      return NextResponse.json(
        { error: "Forbidden - only organizers can access event details" },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ event })
  } catch (error) {
    // Return 401 for authentication errors
    if (error instanceof UnauthorizedError) {
      console.warn("[API] Unauthorized access attempt to fitness event")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("[API] Error fetching fitness event:", error)
    return NextResponse.json(
      { error: "Failed to fetch fitness event" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    
    // Get the event to find its activity_id
    const existingEvent = await getFitnessEventById(params.id)
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }
    
    // Check if user can modify this event (organizer or superadmin)
    const canModify = await canModifyEvent(auth, existingEvent.activityId)
    if (!canModify) {
      return NextResponse.json(
        { error: "Forbidden - only organizers can modify events" },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const event = await updateFitnessEvent(params.id, body)
    
    if (!event) {
      return NextResponse.json(
        { error: "Failed to update fitness event" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ event })
  } catch (error) {
    // Return 401 for authentication errors
    if (error instanceof UnauthorizedError) {
      console.warn("[API] Unauthorized access attempt to update fitness event")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("[API] Error updating fitness event:", error)
    return NextResponse.json(
      { error: "Failed to update fitness event" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // PUT is the same as PATCH for this endpoint
  return PATCH(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    
    // Get the event to find its activity_id
    const existingEvent = await getFitnessEventById(params.id)
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }
    
    // Check if user can modify this event (organizer or superadmin)
    const canModify = await canModifyEvent(auth, existingEvent.activityId)
    if (!canModify) {
      return NextResponse.json(
        { error: "Forbidden - only organizers can delete events" },
        { status: 403 }
      )
    }
    
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("fitness_events")
      .delete()
      .eq("id", params.id)
    
    if (error) {
      console.error("[API] Error deleting fitness event:", error)
      return NextResponse.json(
        { error: "Failed to delete fitness event" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // Return 401 for authentication errors
    if (error instanceof UnauthorizedError) {
      console.warn("[API] Unauthorized access attempt to delete fitness event")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("[API] Error deleting fitness event:", error)
    return NextResponse.json(
      { error: "Failed to delete fitness event" },
      { status: 500 }
    )
  }
}
