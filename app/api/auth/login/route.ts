import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SUPERADMIN_PIN = "9406"

export async function POST(request: Request) {
  try {
    const { friendId, pin } = await request.json()

    // Check if it's superadmin login
    if (pin === SUPERADMIN_PIN) {
      return NextResponse.json({
        success: true,
        role: "superadmin",
        friendId: null,
        friendName: "Putra (Admin)",
      })
    }

    // Validate friend PIN
    const supabase = await createClient()
    const { data: friend, error } = await supabase
      .from("friends")
      .select("id, name, pin")
      .eq("id", friendId)
      .single()

    if (error || !friend) {
      return NextResponse.json(
        { success: false, message: "Friend not found" },
        { status: 404 }
      )
    }

    // Compare PINs (in future, these should be hashed)
    if (friend.pin !== pin) {
      return NextResponse.json(
        { success: false, message: "Invalid PIN" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      role: "friend",
      friendId: friend.id,
      friendName: friend.name,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    )
  }
}
