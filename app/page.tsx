"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultiMonthCalendar } from "@/components/multi-month-calendar"
import { AvailabilityOverview } from "@/components/availability-overview"
import { PublicHolidaysSidebar } from "@/components/public-holidays-sidebar"
import { FriendRequestForm } from "@/components/friend-request-form"
import { getStoredData } from "@/lib/storage"
import type { AppData } from "@/lib/types"
import { Settings, Calendar, Users, Lightbulb, History } from "lucide-react"
import Link from "next/link"
import { BusiestLeaderboard } from "@/components/busiest-leaderboard"
import { ActivityLogFeed } from "@/components/activity-log-feed"

export default function HomePage() {
  const [data, setData] = useState<AppData>({ friends: [], groups: [], activities: [], pendingRequests: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const loadedData = await getStoredData()
      setData(loadedData)
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">gengputrafreebila</h1>
                <p className="text-sm text-muted-foreground">semua busy kan so boleh check sini tengok siapa free ye</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/past-trips">
                <Button variant="ghost" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Kisah Lama</span>
                </Button>
              </Link>
              <Link href="/feature-requests">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Nak feature </span>
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="shadow-sm bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {data.friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to gengputrafreebila</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by adding your friends and their activities in the admin dashboard.
            </p>
            <Link href="/admin">
              <Button size="lg" className="shadow-md">
                <Settings className="h-4 w-4 mr-2" />
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <ActivityLogFeed />

              <Tabs defaultValue="availability" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="availability" className="gap-2">
                    <Users className="h-4 w-4" />
                    Availability
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="availability" className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Next 6 Months
                    </h2>
                    <p className="text-muted-foreground">Siapa yang free dan tak free. </p>
                  </div>
                  <AvailabilityOverview data={data} monthsAhead={6} />
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Calendar View
                    </h2>
                    <p className="text-muted-foreground">See everyone's schedule at a glance</p>
                  </div>

                  <MultiMonthCalendar activities={data.activities} friends={data.friends} monthCount={6} />
                </TabsContent>
              </Tabs>

              <section>
                <FriendRequestForm />
              </section>
            </div>

            <aside className="space-y-6">
              <BusiestLeaderboard data={data} monthsAhead={6} />
              <PublicHolidaysSidebar />
            </aside>
          </div>
        )}
      </main>

      <footer className="border-t mt-16 bg-muted/30">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>gengputrafreebila - demi meluangkan masa bersama </p>
        </div>
      </footer>
    </div>
  )
}
