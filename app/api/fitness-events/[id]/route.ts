import { NextRequest, NextResponse } from "next/server"
import { getFitnessEventWithDetails, updateFitnessEvent, getFitnessEventById } from "@/lib/fitness-events-storage"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // PUT is the same as PATCH for this endpoint
  return PATCH(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("fitness_events")
      .delete()
      .eq("id", params.id)
    
    if (error) {
      console.error("[API] Error deleting fitness event:", error)
      return NextResponse.json(
        { error: "Failed to delete fitness event" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error deleting fitness event:", error)
    return NextResponse.json(
      { error: "Failed to delete fitness event" },
      { status: 500 }
    )
  }
}
