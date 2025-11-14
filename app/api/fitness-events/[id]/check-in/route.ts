import { NextRequest, NextResponse } from "next/server"
import { checkInParticipant, getFitnessEventById } from "@/lib/fitness-events-storage"
import { requireAuth, canModifyEvent } from "@/lib/server-auth"

export async function POST(
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
    
    // Only organizers can check in participants
    const canModify = await canModifyEvent(auth, existingEvent.activityId)
    if (!canModify) {
      return NextResponse.json(
        { error: "Forbidden - only organizers can check in participants" },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { friendId, attendanceStatus } = body
    
    if (!friendId || !attendanceStatus) {
      return NextResponse.json(
        { error: "Friend ID and attendance status are required" },
        { status: 400 }
      )
    }
    
    // FIX: Support all attendance statuses
    if (!["checked_in", "no_show", "pending"].includes(attendanceStatus)) {
      return NextResponse.json(
        { error: "Invalid attendance status" },
        { status: 400 }
      )
    }
    
    // Update attendance status (supports checked_in, no_show, pending)
    const success = await checkInParticipant(params.id, friendId, attendanceStatus)
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update attendance status" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error checking in participant:", error)
    return NextResponse.json(
      { error: "Failed to check in participant" },
      { status: 500 }
    )
  }
}
