"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getActivityLogs } from "@/lib/storage"
import type { ActivityLog } from "@/lib/types"
import { Calendar, Trash2, Check, X, MapPin, Users, Clock } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
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
      case "friend_created":
        return <Users className="h-4 w-4 text-green-500" />
      case "friend_updated":
        return <Users className="h-4 w-4 text-blue-500" />
      case "friend_deleted":
        return <Users className="h-4 w-4 text-red-500" />
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
      case "friend_created":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            Friend Added
          </Badge>
        )
      case "friend_updated":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
            Friend Updated
          </Badge>
        )
      case "friend_deleted":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
            Friend Removed
          </Badge>
        )
      default:
        return null
    }
  }

  const getActionText = (log: ActivityLog) => {
    const typeLabel = log.activityType === "trip" ? "trip" : "activity"
    
    switch (log.actionType) {
      case "trip_created":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> created {typeLabel}{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      case "trip_updated":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> updated {typeLabel}{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      case "trip_deleted":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> deleted {typeLabel}{" "}
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
      case "friend_created":
        return (
          <>
            <span className="font-semibold">{log.activityTitle}</span> joined as a friend
          </>
        )
      case "friend_updated":
        return (
          <>
            <span className="font-semibold">{log.activityTitle}</span> updated their profile
          </>
        )
      case "friend_deleted":
        return (
          <>
            <span className="font-semibold">{log.activityTitle}</span> was removed from friends
          </>
        )
      default:
        return null
    }
  }
  
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return null
    
    try {
      const start = format(new Date(startDate), "MMM d, yyyy")
      if (!endDate) return start
      
      const end = format(new Date(endDate), "MMM d, yyyy")
      if (start === end) return start
      
      return `${start} - ${end}`
    } catch {
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
                    
                    {/* Show comprehensive details for deletions */}
                    {log.actionType === "trip_deleted" && (log.startDate || log.location || log.participantNames) && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30 space-y-2">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Deleted Activity Details:</p>
                        
                        {log.startDate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 text-red-600 dark:text-red-400" />
                            <span className="font-medium">Dates:</span>
                            <span>{formatDateRange(log.startDate, log.endDate)}</span>
                          </div>
                        )}
                        
                        {log.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 text-red-600 dark:text-red-400" />
                            <span className="font-medium">Location:</span>
                            <span>{log.location}</span>
                          </div>
                        )}
                        
                        {log.participantNames && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3 text-red-600 dark:text-red-400" />
                            <span className="font-medium">Participants:</span>
                            <span>{log.participantNames}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
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
