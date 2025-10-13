"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMonthData, formatMonthYear, type MonthData } from "@/lib/calendar-utils"
import type { Activity, Friend } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  month: number
  year: number
  activities: Activity[]
  friends: Friend[]
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarView({ month, year, activities, friends }: CalendarViewProps) {
  const monthData: MonthData = useMemo(
    () => getMonthData(year, month, activities, friends),
    [year, month, activities, friends],
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{formatMonthYear(month, year)}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day.slice(0, 1)}
            </div>
          ))}
          {monthData.days.map((day, index) => {
            const isToday = day.date.getTime() === today.getTime()

            return (
              <div
                key={index}
                className={cn(
                  "min-h-12 p-1 border rounded transition-colors text-xs",
                  !day.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  day.isCurrentMonth && "bg-card hover:bg-accent/50",
                  isToday && "ring-2 ring-primary",
                )}
              >
                <div className="text-xs font-medium mb-0.5">{day.date.getDate()}</div>
                {day.friends.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {day.friends.slice(0, 2).map((friend) => (
                      <Avatar key={friend.id} className="h-4 w-4 border">
                        <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                        <AvatarFallback className="text-[6px]">{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                    {day.friends.length > 2 && (
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[6px] font-bold text-primary">
                        +{day.friends.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
