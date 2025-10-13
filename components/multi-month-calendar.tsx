"use client"

import { CalendarMonthCard } from "@/components/calendar-month-card"
import { getNextMonths } from "@/lib/calendar-utils"
import type { Activity, Friend } from "@/lib/types"

interface MultiMonthCalendarProps {
  activities: Activity[]
  friends: Friend[]
  monthCount?: number
}

export function MultiMonthCalendar({ activities, friends, monthCount = 3 }: MultiMonthCalendarProps) {
  const months = getNextMonths(monthCount)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {months.map(({ month, year }) => (
          <CalendarMonthCard
            key={`${year}-${month}`}
            month={month}
            year={year}
            activities={activities}
            friends={friends}
          />
        ))}
      </div>
    </div>
  )
}
