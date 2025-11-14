import { NextRequest, NextResponse } from "next/server"
import { getFitnessEventWithDetails, updateFitnessEvent } from "@/lib/fitness-events-storage"

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("x-auth-role")
  return authHeader === "superadmin" || authHeader === "friend"
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
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
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
