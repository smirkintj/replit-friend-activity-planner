import { NextRequest, NextResponse } from "next/server"
import { checkInParticipant } from "@/lib/fitness-events-storage"

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("x-auth-role")
  return authHeader === "superadmin" || authHeader === "friend"
}

export async function POST(
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
    const { friendId, attendanceStatus } = body
    
    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      )
    }
    
    if (attendanceStatus === "checked_in") {
      const success = await checkInParticipant(params.id, friendId)
      
      if (!success) {
        return NextResponse.json(
          { error: "Failed to check in participant" },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    // Handle "no_show" status
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error checking in participant:", error)
    return NextResponse.json(
      { error: "Failed to check in participant" },
      { status: 500 }
    )
  }
}
