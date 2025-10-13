"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AppData } from "@/lib/types"
import { Calendar, MapPin, Users } from "lucide-react"
import { format, parseISO } from "date-fns"

interface ActivitiesViewProps {
  data: AppData
}

export function ActivitiesView({ data }: ActivitiesViewProps) {
  const activitiesWithFriends = useMemo(() => {
    return data.activities.map((activity) => {
      const friend = data.friends.find((f) => f.id === activity.friendId)
      return {
        ...activity,
        friend,
      }
    })
  }, [data.activities, data.friends])

  // Group activities by activity name/type
  const groupedActivities = useMemo(() => {
    const groups = new Map<string, typeof activitiesWithFriends>()

    activitiesWithFriends.forEach((activity) => {
      const key = `${activity.title}-${activity.startDate}-${activity.endDate}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(activity)
    })

    return Array.from(groups.values()).sort((a, b) => {
      return new Date(a[0].startDate).getTime() - new Date(b[0].startDate).getTime()
    })
  }, [activitiesWithFriends])

  if (data.activities.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
        <p className="text-sm text-muted-foreground">Add activities in the admin dashboard to see them here.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {groupedActivities.map((activityGroup, index) => {
        const mainActivity = activityGroup[0]
        const participants = activityGroup.filter((a) => a.friend).map((a) => a.friend!)

        return (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{mainActivity.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {format(parseISO(mainActivity.startDate), "MMM d")} -{" "}
                          {format(parseISO(mainActivity.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      {mainActivity.type && (
                        <Badge variant="secondary" className="text-xs">
                          {mainActivity.type}
                        </Badge>
                      )}
                      {mainActivity.withWho && (
                        <Badge variant="outline" className="text-xs">
                          {mainActivity.withWho}
                        </Badge>
                      )}
                    </div>
                    {mainActivity.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">{mainActivity.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    {participants.length} {participants.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {participants.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                        <AvatarFallback className="text-xs">{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{friend.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
