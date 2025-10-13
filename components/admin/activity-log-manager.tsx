"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getActivityLogs } from "@/lib/storage"
import type { ActivityLog } from "@/lib/types"
import { Calendar, Trash2, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function ActivityLogManager() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLogs = async () => {
      const data = await getActivityLogs()
      setLogs(data)
      setIsLoading(false)
    }
    loadLogs()

    // Refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  const getActionIcon = (actionType: ActivityLog["actionType"]) => {
    switch (actionType) {
      case "trip_created":
        return <Calendar className="h-4 w-4 text-green-500" />
      case "trip_updated":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "trip_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "join_approved":
        return <Check className="h-4 w-4 text-green-500" />
      case "join_rejected":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getActionBadge = (actionType: ActivityLog["actionType"]) => {
    switch (actionType) {
      case "trip_created":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            Created
          </Badge>
        )
      case "trip_updated":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
            Updated
          </Badge>
        )
      case "trip_deleted":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
            Deleted
          </Badge>
        )
      case "join_approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            Join Approved
          </Badge>
        )
      case "join_rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
            Join Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getActionText = (log: ActivityLog) => {
    switch (log.actionType) {
      case "trip_created":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> created trip{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      case "trip_updated":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> updated trip{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      case "trip_deleted":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> deleted trip{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      case "join_approved":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> approved join request for{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      case "join_rejected":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> rejected join request for{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading activity logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No activity logs yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getActionIcon(log.actionType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.actionType)}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm">{getActionText(log)}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">{log.details}</p>
                    )}
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
