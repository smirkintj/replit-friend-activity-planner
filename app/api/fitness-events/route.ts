import { NextRequest, NextResponse } from "next/server"
import { createFitnessEvent, getUpcomingFitnessEvents } from "@/lib/fitness-events-storage"

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("x-auth-role")
  return authHeader === "superadmin" || authHeader === "friend"
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
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
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
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
