import type { Activity, Friend } from "./types"

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  activities: Activity[]
  friends: Friend[]
}

export interface MonthData {
  month: number
  year: number
  days: CalendarDay[]
}

function normalizeToLocalDate(dateInput: Date | string): Date {
  const date = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput)
  // Create a new date at local midnight to avoid timezone issues
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getMonthData(year: number, month: number, activities: Activity[], friends: Friend[]): MonthData {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  const dayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days to Monday
  startDate.setDate(startDate.getDate() - daysToSubtract)

  const days: CalendarDay[] = []
  const currentDate = new Date(startDate)

  // Generate 6 weeks of days
  for (let i = 0; i < 42; i++) {
    const normalizedCurrentDate = normalizeToLocalDate(currentDate)

    const dayActivities = activities.filter((activity) => {
      const activityStart = normalizeToLocalDate(activity.startDate)
      const activityEnd = normalizeToLocalDate(activity.endDate)
      return normalizedCurrentDate >= activityStart && normalizedCurrentDate <= activityEnd
    })

    const dayFriends = dayActivities
      .map((activity) => friends.find((f) => f.id === activity.friendId))
      .filter((f): f is Friend => f !== undefined)

    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      activities: dayActivities,
      friends: dayFriends,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return { month, year, days }
}

export function getNextMonths(count: number): { month: number; year: number }[] {
  const result: { month: number; year: number }[] = []
  const now = new Date()
  let month = now.getMonth()
  let year = now.getFullYear()

  for (let i = 0; i < count; i++) {
    result.push({ month, year })
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return result
}

export function formatMonthYear(month: number, year: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}
