"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMonthData, formatMonthYear, type MonthData } from "@/lib/calendar-utils"
import type { Activity, Friend } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { TripDetailModal } from "@/components/trip-detail-modal"

interface CalendarMonthCardProps {
  month: number
  year: number
  activities: Activity[]
  friends: Friend[]
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const activityTypeColors = {
  trip: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  activity: "bg-purple-500/20 text-purple-700 border-purple-500/30",
}

const MAX_ACTIVITIES_PREVIEW = 3

export function CalendarMonthCard({ month, year, activities, friends }: CalendarMonthCardProps) {
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(true)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const monthData: MonthData = useMemo(
    () => getMonthData(year, month, activities, friends),
    [year, month, activities, friends],
  )

  const monthActivities = useMemo(() => {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    return activities
      .filter((activity) => {
        const activityStartStr = activity.startDate
        const activityEndStr = activity.endDate
        const activityStartDate = new Date(activityStartStr)
        const activityEndDate = new Date(activityEndStr)

        const activityStart = new Date(
          activityStartDate.getFullYear(),
          activityStartDate.getMonth(),
          activityStartDate.getDate(),
        )
        const activityEnd = new Date(
          activityEndDate.getFullYear(),
          activityEndDate.getMonth(),
          activityEndDate.getDate(),
        )

        return activityStart <= monthEnd && activityEnd >= monthStart
      })
      .map((activity) => {
        const activityFriends = activity.friendIds
          ? activity.friendIds.map((id) => friends.find((f) => f.id === id)).filter((f): f is Friend => f !== undefined)
          : [friends.find((f) => f.id === activity.friendId)].filter((f): f is Friend => f !== undefined)

        return { ...activity, friends: activityFriends }
      })
  }, [activities, friends, month, year])

  const today = new Date()
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startDay = start.getDate()
    const endDay = end.getDate()
    const monthName = start.toLocaleString("default", { month: "short" })

    if (startDay === endDay) {
      return `${startDay} ${monthName}`
    }
    return `${startDay}-${endDay} ${monthName}`
  }

  const displayedActivities = useMemo(() => {
    if (showAllActivities || monthActivities.length <= MAX_ACTIVITIES_PREVIEW) {
      return monthActivities
    }
    return monthActivities.slice(0, MAX_ACTIVITIES_PREVIEW)
  }, [monthActivities, showAllActivities])

  const hasMoreActivities = monthActivities.length > MAX_ACTIVITIES_PREVIEW

  return (
    <Card className="shadow-md border-2">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="text-xl font-bold">{formatMonthYear(month, year)}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Activities List */}
        {monthActivities.length > 0 && (
          <div className="space-y-2 pb-4 border-b">
            <button
              onClick={() => setIsActivitiesExpanded(!isActivitiesExpanded)}
              className="flex items-center justify-between w-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Activities this month ({monthActivities.length})</span>
              {isActivitiesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isActivitiesExpanded && (
              <div className="space-y-2">
                {displayedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedActivity(activity)
                      setShowDetailModal(true)
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("text-xs", activityTypeColors[activity.type])}>
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDateRange(activity.startDate, activity.endDate)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm truncate">{activity.title}</h4>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {activity.friends.slice(0, 5).map((friend) => (
                          <Avatar key={friend.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                            <AvatarFallback className="text-[8px]">
                              {friend.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {activity.friends.length > 5 && (
                          <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-medium">
                            +{activity.friends.length - 5}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity.friends.length} {activity.friends.length === 1 ? "person" : "people"}
                      </span>
                    </div>
                  </div>
                ))}
                {hasMoreActivities && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="w-full text-xs"
                  >
                    {showAllActivities ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        View All ({monthActivities.length - MAX_ACTIVITIES_PREVIEW} more)
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {monthData.days.map((day, index) => {
              const normalizedDayDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate())
              const isToday = normalizedDayDate.getTime() === normalizedToday.getTime()

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-14 p-1.5 border rounded-md transition-colors text-xs",
                    !day.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    day.isCurrentMonth && "bg-card hover:bg-accent/50",
                    isToday && "ring-2 ring-primary bg-primary/5",
                  )}
                >
                  <div className="text-xs font-medium mb-1">{day.date.getDate()}</div>
                  {day.friends.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {day.friends.slice(0, 3).map((friend) => (
                        <Avatar key={friend.id} className="h-4 w-4 border">
                          <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                          <AvatarFallback className="text-[6px]">
                            {friend.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {day.friends.length > 3 && (
                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[6px] font-bold text-primary">
                          +{day.friends.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <TripDetailModal
          activity={selectedActivity}
          friends={friends}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      </CardContent>
    </Card>
  )
}
