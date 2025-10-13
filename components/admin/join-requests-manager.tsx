"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2 } from "lucide-react"
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/lib/storage"
import type { JoinRequest, AppData } from "@/lib/types"

interface JoinRequestsManagerProps {
  data: AppData
  onUpdate: () => void
}

export function JoinRequestsManager({ data, onUpdate }: JoinRequestsManagerProps) {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadJoinRequests()
  }, [])

  const loadJoinRequests = async () => {
    setIsLoading(true)
    try {
      const requests = await getJoinRequests()
      setJoinRequests(requests)
    } catch (error) {
      console.error("[v0] Error loading join requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (request: JoinRequest) => {
    setProcessingId(request.id)
    try {
      await approveJoinRequest(request.id, request.activityId, request.friendId)
      await loadJoinRequests()
      onUpdate()
    } catch (error) {
      console.error("[v0] Error approving join request:", error)
      alert("Failed to approve request. Please try again.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      await rejectJoinRequest(requestId)
      await loadJoinRequests()
    } catch (error) {
      console.error("[v0] Error rejecting join request:", error)
      alert("Failed to reject request. Please try again.")
    } finally {
      setProcessingId(null)
    }
  }

  const getProbabilityBadge = (probability: string) => {
    switch (probability) {
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200">✅ Confirmed</Badge>
      case "maybe":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">🤔 Maybe</Badge>
      case "unlikely":
        return <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">❓ Unlikely</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Join Requests</h2>
        <p className="text-sm text-muted-foreground">Approve or reject requests to join activities</p>
      </div>

      {joinRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending join requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {joinRequests.map((request) => {
            const friend = data.friends.find((f) => f.id === request.friendId)
            const activity = data.activities.find((a) => a.id === request.activityId)

            if (!friend || !activity) return null

            return (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                      <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {friend.name} wants to join: {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.startDate).toLocaleDateString()} -{" "}
                        {new Date(activity.endDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2">{getProbabilityBadge(request.probability)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(request)} disabled={processingId === request.id}>
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
