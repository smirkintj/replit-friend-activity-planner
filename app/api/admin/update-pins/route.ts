import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SUPERADMIN_PIN = "9406"

function generateRandomPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { adminPin } = body

    // Verify superadmin PIN
    if (adminPin !== SUPERADMIN_PIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all friends (excluding owner if needed)
    const { data: friends, error: fetchError } = await supabase
      .from("friends")
      .select("id, name, is_owner")
      .order("name")

    if (fetchError) {
      console.error("[v0] Error fetching friends:", fetchError)
      return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
    }

    if (!friends || friends.length === 0) {
      return NextResponse.json({ message: "No friends to update" })
    }

    // Generate unique PINs
    const usedPins = new Set<string>()
    usedPins.add(SUPERADMIN_PIN) // Reserve superadmin PIN
    
    const updates = friends.map((friend) => {
      let pin: string
      do {
        pin = generateRandomPin()
      } while (usedPins.has(pin))
      
      usedPins.add(pin)
      
      return {
        id: friend.id,
        name: friend.name,
        pin,
        is_owner: friend.is_owner
      }
    })

    // Update all friends with new PINs
    const updatePromises = updates.map((update) =>
      supabase
        .from("friends")
        .update({ pin: update.pin })
        .eq("id", update.id)
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} friends with new PINs`,
      updates: updates.map(u => ({
        name: u.name,
        pin: u.pin,
        isOwner: u.is_owner
      }))
    })
  } catch (error) {
    console.error("[v0] Error updating PINs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
