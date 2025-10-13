import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SUPERADMIN_PIN = "9406"

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    // Check if it's superadmin login
    if (pin === SUPERADMIN_PIN) {
      return NextResponse.json({
        success: true,
        role: "superadmin",
        friendId: null,
        friendName: "Putra (Admin)",
      })
    }

    // Look up friend by PIN
    const supabase = await createClient()
    const { data: friends, error } = await supabase
      .from("friends")
      .select("id, name, pin")
      .eq("pin", pin)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { success: false, message: "Database error" },
        { status: 500 }
      )
    }

    if (!friends || friends.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid PIN" },
        { status: 401 }
      )
    }

    // Use the first friend with this PIN
    const friend = friends[0]

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
