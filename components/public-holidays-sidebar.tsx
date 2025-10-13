"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp } from "lucide-react"
import { malaysiaHolidays } from "@/lib/malaysia-holidays"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { addMonths, isAfter, isBefore } from "date-fns"

export function PublicHolidaysSidebar() {
  const today = new Date()
  const defaultEndDate = addMonths(today, 6)

  const [startDate, setStartDate] = useState<Date>(today)
  const [endDate, setEndDate] = useState<Date>(defaultEndDate)
  const [isSelectingRange, setIsSelectingRange] = useState(false)

  const filteredHolidays = malaysiaHolidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date)
    return isAfter(holidayDate, startDate) && isBefore(holidayDate, endDate)
  })

  const formatDateRange = () => {
    return `${startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
  }
  // </CHANGE>

  return (
    <Card className="glass-card h-fit sticky top-24 hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg gradient-text">
          <Calendar className="h-5 w-5 text-primary" />
          Malaysia Public Holidays
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Popover open={isSelectingRange} onOpenChange={setIsSelectingRange}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > endDate}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date (up to 1 year)</p>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < startDate || date > addMonths(startDate, 12)}
                  />
                </div>
                <Button size="sm" onClick={() => setIsSelectingRange(false)} className="w-full">
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {/* </CHANGE> */}
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredHolidays.map((holiday) => (
          <div key={holiday.date} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight">{holiday.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(holiday.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {holiday.extendedLeave && (
              <div className="bg-accent/30 rounded-md p-2 space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-accent-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Extended Leave Tip</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Take leave on{" "}
                  {holiday.extendedLeave.takeLeave
                    .map((d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }))
                    .join(", ")}{" "}
                  for {holiday.extendedLeave.totalDays} days total
                </p>
              </div>
            )}
          </div>
        ))}
        {filteredHolidays.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No holidays in selected range</p>
        )}
      </CardContent>
    </Card>
  )
}
