import { NextRequest, NextResponse } from "next/server"
import { createFitnessEvent, getUpcomingFitnessEvents, getFitnessEventByActivityId } from "@/lib/fitness-events-storage"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activityId = searchParams.get("activityId")
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10
    
    // If activityId is provided, fetch specific fitness event
    if (activityId) {
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
    console.error("[API] Error fetching fitness events:", error)
    return NextResponse.json(
      { error: "Failed to fetch fitness events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activityId, organizerId, ...eventData } = body
    
    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      )
    }
    
    if (!organizerId) {
      return NextResponse.json(
        { error: "Organizer ID is required" },
        { status: 400 }
      )
    }
    
    const event = await createFitnessEvent(activityId, { ...eventData, organizerId })
    
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
