"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicActivityLogs } from "@/lib/storage"
import type { ActivityLog } from "@/lib/types"
import { Calendar, Trash2, Edit } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export function ActivityLogFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const loadLogs = async () => {
      console.log("[v0] Loading activity logs...")
      const data = await getPublicActivityLogs(20)
      console.log("[v0] Activity logs loaded:", data.length, "logs")
      setLogs(data)
      setIsLoading(false)
    }
    loadLogs()

    // Refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollRef.current && logs.length > 3) {
      const scrollElement = scrollRef.current
      let scrollPosition = 0
      const scrollSpeed = 0.5 // Slow, smooth scroll like movie credits

      const animate = () => {
        if (scrollElement) {
          scrollPosition += scrollSpeed

          // When we reach the end, smoothly loop back to start
          if (scrollPosition >= scrollElement.scrollHeight - scrollElement.clientHeight) {
            scrollPosition = 0
          }

          scrollElement.scrollTop = scrollPosition
        }
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [logs])

  const getActionIcon = (actionType: ActivityLog["actionType"]) => {
    switch (actionType) {
      case "trip_created":
        return <Calendar className="h-3 w-3 text-green-500" />
      case "trip_updated":
        return <Edit className="h-3 w-3 text-blue-500" />
      case "trip_deleted":
        return <Trash2 className="h-3 w-3 text-red-500" />
      default:
        return <Calendar className="h-3 w-3" />
    }
  }

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return null

    try {
      const start = new Date(startDate)
      const formattedStart = format(start, "MMM d")

      if (!endDate) {
        return formattedStart
      }

      const end = new Date(endDate)
      const formattedEnd = format(end, "MMM d")

      // If same date, show only once
      if (formattedStart === formattedEnd) {
        return formattedStart
      }

      return `${formattedStart} - ${formattedEnd}`
    } catch (error) {
      return null
    }
  }

  const getActionText = (log: ActivityLog) => {
    const typeLabel = log.activityType === "trip" ? "trip" : "activity"
    const participantsText = log.participantNames ? ` with ${log.participantNames}` : ""

    switch (log.actionType) {
      case "trip_created":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> created {typeLabel}{" "}
            <span className="font-semibold">{log.activityTitle}</span>
            {participantsText}
          </>
        )
      case "trip_updated":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> updated {typeLabel}{" "}
            <span className="font-semibold">{log.activityTitle}</span>
            {participantsText}
          </>
        )
      case "trip_deleted":
        return (
          <>
            <span className="font-semibold">{log.friendName || "Someone"}</span> deleted {typeLabel}{" "}
            <span className="font-semibold">{log.activityTitle}</span>
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="space-y-2 max-h-[180px] overflow-hidden" style={{ scrollBehavior: "auto" }}>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  {getActionIcon(log.actionType)}
                  {log.startDate && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {formatDateRange(log.startDate, log.endDate)}
                    </span>
                  )}
                  {log.location && (
                    <>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{log.location}</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed pl-5">{getActionText(log)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 pl-5">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
