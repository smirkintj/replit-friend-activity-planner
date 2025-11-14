import { NextRequest, NextResponse } from "next/server"
import { updateParticipantRsvp, addFitnessEventParticipant } from "@/lib/fitness-events-storage"
import { requireAuth } from "@/lib/server-auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    
    const body = await request.json()
    const { friendId, rsvpStatus } = body
    
    if (!friendId || !rsvpStatus) {
      return NextResponse.json(
        { error: "Friend ID and RSVP status are required" },
        { status: 400 }
      )
    }
    
    if (!["invited", "going", "maybe", "declined", "waitlist"].includes(rsvpStatus)) {
      return NextResponse.json(
        { error: "Invalid RSVP status" },
        { status: 400 }
      )
    }
    
    // Try to update existing participant, or add new one
    const success = await updateParticipantRsvp(params.id, friendId, rsvpStatus)
    
    if (!success) {
      // Participant doesn't exist, create new one
      const participant = await addFitnessEventParticipant(params.id, friendId, rsvpStatus)
      
      if (!participant) {
        return NextResponse.json(
          { error: "Failed to update RSVP" },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ participant }, { status: 201 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error updating RSVP:", error)
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    )
  }
}
