import { NextRequest, NextResponse } from "next/server"
import { getFitnessEventWithDetails, updateFitnessEvent, getFitnessEventById } from "@/lib/fitness-events-storage"
import { requireAuth, canModifyEvent } from "@/lib/server-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request)
    
    const event = await getFitnessEventWithDetails(params.id)
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ event })
  } catch (error) {
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
    
    // Check if user can modify this event
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
    console.error("[API] Error updating fitness event:", error)
    return NextResponse.json(
      { error: "Failed to update fitness event" },
      { status: 500 }
    )
  }
}
