import { NextRequest, NextResponse } from "next/server"
import { createFitnessEvent, getUpcomingFitnessEvents } from "@/lib/fitness-events-storage"
import { requireAuth } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activityId = searchParams.get("activityId")
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10
    
    // If activityId is provided, fetch specific fitness event (requires auth)
    if (activityId) {
      const { requireAuth, canModifyEvent } = await import("@/lib/server-auth")
      const auth = await requireAuth(request)
      
      // Check if user can access this event (organizer-only)
      const canModify = await canModifyEvent(auth, activityId)
      if (!canModify) {
        return NextResponse.json(
          { error: "Forbidden - only organizers can access event details" },
          { status: 403 }
        )
      }
      
      const { getFitnessEventByActivityId } = await import("@/lib/fitness-events-storage")
      const event = await getFitnessEventByActivityId(activityId)
      
      if (event) {
        return NextResponse.json({ event })
      } else {
        return NextResponse.json({ event: null })
      }
    }
    
    // Otherwise, fetch upcoming events (public endpoint)
    // NOTE: Public listing endpoint - anyone can view upcoming events
    const events = await getUpcomingFitnessEvents(limit)
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error("[API] Error fetching fitness events:", error)
    return NextResponse.json(
      { error: "Failed to fetch fitness events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)
    
    const body = await request.json()
    const { activityId, ...eventData } = body
    
    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      )
    }
    
    const event = await createFitnessEvent(activityId, eventData)
    
    if (!event) {
      return NextResponse.json(
        { error: "Failed to create fitness event" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating fitness event:", error)
    return NextResponse.json(
      { error: "Failed to create fitness event" },
      { status: 500 }
    )
  }
}
