import { NextRequest, NextResponse } from "next/server"
import { createFitnessEvent, getUpcomingFitnessEvents } from "@/lib/fitness-events-storage"
import { requireAuth } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    // NOTE: GET endpoint is public - anyone can view upcoming events
    // Authentication is only required for creating/editing events
    
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10
    
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
