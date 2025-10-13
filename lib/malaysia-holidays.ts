import type { PublicHoliday } from "./types"

// Malaysia Public Holidays for Q4 2025 and Q1-Q3 2026
export const malaysiaHolidays: PublicHoliday[] = [
  // Q4 2025
  {
    date: "2025-10-20",
    name: "Deepavali",
    extendedLeave: {
      takeLeave: ["2025-10-21", "2025-10-22", "2025-10-23", "2025-10-24"],
      totalDays: 9,
    },
  },
  {
    date: "2025-12-25",
    name: "Christmas Day",
    extendedLeave: {
      takeLeave: ["2025-12-26"],
      totalDays: 4,
    },
  },
  // Q1 2026
  {
    date: "2026-01-01",
    name: "New Year's Day",
    extendedLeave: {
      takeLeave: ["2026-01-02"],
      totalDays: 4,
    },
  },
  {
    date: "2026-01-29",
    name: "Chinese New Year",
  },
  {
    date: "2026-01-30",
    name: "Chinese New Year",
    extendedLeave: {
      takeLeave: ["2026-02-02"],
      totalDays: 5,
    },
  },
  {
    date: "2026-03-05",
    name: "Hari Raya Aidilfitri (estimated)",
  },
  {
    date: "2026-03-06",
    name: "Hari Raya Aidilfitri (estimated)",
    extendedLeave: {
      takeLeave: ["2026-03-02", "2026-03-03", "2026-03-04"],
      totalDays: 9,
    },
  },
  // Q2 2026
  {
    date: "2026-05-01",
    name: "Labour Day",
    extendedLeave: {
      takeLeave: ["2026-04-30"],
      totalDays: 4,
    },
  },
  {
    date: "2026-05-11",
    name: "Hari Raya Aidiladha (estimated)",
    extendedLeave: {
      takeLeave: ["2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15"],
      totalDays: 9,
    },
  },
  {
    date: "2026-05-26",
    name: "Wesak Day",
  },
  {
    date: "2026-06-01",
    name: "Agong's Birthday",
    extendedLeave: {
      takeLeave: ["2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"],
      totalDays: 9,
    },
  },
  // Q3 2026
  {
    date: "2026-08-31",
    name: "Merdeka Day",
    extendedLeave: {
      takeLeave: ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"],
      totalDays: 9,
    },
  },
  {
    date: "2026-09-16",
    name: "Malaysia Day",
  },
]

export const getUpcomingHolidays = (count = 5): PublicHoliday[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return malaysiaHolidays.filter((holiday) => new Date(holiday.date) >= today).slice(0, count)
}
