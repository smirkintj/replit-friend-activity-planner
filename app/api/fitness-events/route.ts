import { NextRequest, NextResponse } from "next/server"
import { createFitnessEvent, getUpcomingFitnessEvents, getFitnessEventByActivityId } from "@/lib/fitness-events-storage"
import { requireAuth, canModifyEvent, UnauthorizedError } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activityId = searchParams.get("activityId")
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10
    
    // If activityId is provided, fetch specific fitness event (requires auth)
    if (activityId) {
      const auth = await requireAuth(request)
      
      // Check if user can access this event (organizer or superadmin)
      const canModify = await canModifyEvent(auth, activityId)
      if (!canModify) {
        return NextResponse.json(
          { error: "Forbidden - only organizers can access event details" },
          { status: 403 }
        )
      }
      
      const event = await getFitnessEventByActivityId(activityId)
      
      if (event) {
        return NextResponse.json({ event })
      } else {
        return NextResponse.json({ event: null })
      }
    }
    
    // Otherwise, fetch upcoming events (public endpoint)
    const events = await getUpcomingFitnessEvents(limit)
    
    return NextResponse.json({ events })
  } catch (error) {
    // Return 401 for authentication errors
    if (error instanceof UnauthorizedError) {
      console.warn("[API] Unauthorized access attempt to fitness events")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("[API] Error fetching fitness events:", error)
    return NextResponse.json(
      { error: "Failed to fetch fitness events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    
    const body = await request.json()
    const { activityId, ...eventData } = body
    
    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      )
    }
    
    // Check if user can create event for this activity (organizer or superadmin)
    const canModify = await canModifyEvent(auth, activityId)
    if (!canModify) {
      return NextResponse.json(
        { error: "Forbidden - only organizers can create fitness events" },
        { status: 403 }
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
    // Return 401 for authentication errors
    if (error instanceof UnauthorizedError) {
      console.warn("[API] Unauthorized access attempt to create fitness event")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("[API] Error creating fitness event:", error)
    return NextResponse.json(
      { error: "Failed to create fitness event" },
      { status: 500 }
    )
  }
}
