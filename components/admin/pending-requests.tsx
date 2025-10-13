"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Calendar, User } from "lucide-react"
import { saveActivity, approveFriendRequest, rejectFriendRequest } from "@/lib/storage"
import type { AppData, PendingRequest } from "@/lib/types"

interface PendingRequestsProps {
  data: AppData
  onUpdate: () => void
}

export function PendingRequests({ data, onUpdate }: PendingRequestsProps) {
  const handleApprove = async (request: PendingRequest) => {
    const friend = data.friends.find((f) => f.name.toLowerCase() === request.friendName.toLowerCase())

    if (!friend) {
      alert(`Friend "${request.friendName}" not found. Please add them first.`)
      return
    }

    await saveActivity({
      friendId: friend.id,
      title: request.activityTitle,
      startDate: request.startDate,
      endDate: request.endDate,
      type: "trip",
      withWho: request.withWho,
      notes: request.notes,
    })

    await approveFriendRequest(request.id)
    onUpdate()
  }

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId)
    onUpdate()
  }

  const pendingRequests = data.pendingRequests || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Pending Requests</h2>
        <p className="text-sm text-muted-foreground">Review and approve friend submissions</p>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending requests at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
            .map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{request.friendName}</span>
                        </div>
                        <h3 className="text-lg font-medium">{request.activityTitle}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        {request.withWho && (
                          <Badge variant="secondary" className="text-xs">
                            With: {request.withWho}
                          </Badge>
                        )}
                        {request.notes && (
                          <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">
                            {request.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(request.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleApprove(request)} className="flex-1" size="sm">
                        <Check className="h-4 w-4 mr-2" />
                        Approve & Add
                      </Button>
                      <Button onClick={() => handleReject(request.id)} variant="outline" className="flex-1" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
