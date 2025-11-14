import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface AuthContext {
  role: "superadmin" | "friend"
  friendId: string | null
  friendName: string
}

const SUPERADMIN_PIN = "9406"

/**
 * Validates authentication from request cookies or headers
 * Returns auth context or null if unauthorized
 */
export async function validateAuth(request: NextRequest): Promise<AuthContext | null> {
  // Try to get auth token from cookie (for browser requests)
  const authToken = request.cookies.get("auth-token")?.value
  
  // Try to get PIN from header (for API requests)
  const authPin = request.headers.get("x-auth-pin")
  
  if (!authToken && !authPin) {
    return null
  }
  
  // Validate PIN if provided
  if (authPin) {
    if (authPin === SUPERADMIN_PIN) {
      return {
        role: "superadmin",
        friendId: null,
        friendName: "Putra (Admin)",
      }
    }
    
    const supabase = await createClient()
    const { data: friends } = await supabase
      .from("friends")
      .select("id, name")
      .eq("pin", authPin)
      .limit(1)
    
    if (friends && friends.length > 0) {
      return {
        role: "friend",
        friendId: friends[0].id,
        friendName: friends[0].name,
      }
    }
  }
  
  // If no valid auth found
  return null
}

/**
 * Middleware helper to check if user is authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await validateAuth(request)
  
  if (!auth) {
    throw new Error("Unauthorized")
  }
  
  return auth
}

/**
 * Check if user can modify a specific event (organizer or superadmin)
 */
export async function canModifyEvent(
  auth: AuthContext,
  activityId: string
): Promise<boolean> {
  if (auth.role === "superadmin") {
    return true
  }
  
  const supabase = await createClient()
  const { data: activity } = await supabase
    .from("activities")
    .select("organizer_id")
    .eq("id", activityId)
    .single()
  
  return activity?.organizer_id === auth.friendId
}
