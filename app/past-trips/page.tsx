"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStoredData } from "@/lib/storage"
import type { AppData, Activity, Friend } from "@/lib/types"
import { Calendar, ArrowLeft, MapPin, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import { format, isPast } from "date-fns"
import { TripDetailModal } from "@/components/trip-detail-modal"

const activityTypeColors = {
  trip: "bg-blue-500 text-white",
  activity: "bg-purple-500 text-white",
}

export default function PastTripsPage() {
  const [data, setData] = useState<AppData>({ friends: [], groups: [], activities: [], pendingRequests: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const loadedData = await getStoredData()
      setData(loadedData)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const pastActivities = data.activities
    .filter((activity) => isPast(new Date(activity.endDate)))
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    .map((activity) => {
      const activityFriends = activity.friendIds
        ? activity.friendIds
            .map((id) => data.friends.find((f) => f.id === id))
            .filter((f): f is Friend => f !== undefined)
        : [data.friends.find((f) => f.id === activity.friendId)].filter((f): f is Friend => f !== undefined)

      return { ...activity, friends: activityFriends }
    })

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
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Past Trips & Activities</h1>
                <p className="text-sm text-muted-foreground">Memories from previous adventures</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {pastActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Past Trips Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">Your completed trips and activities will appear here.</p>
            <Link href="/">
              <Button size="lg" className="shadow-md">
                Go to Home
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {pastActivities.length} Past {pastActivities.length === 1 ? "Trip" : "Trips"}
              </h2>
              <p className="text-muted-foreground">Click on any trip to see full details</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedActivity(activity)
                    setShowDetailModal(true)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{activity.title}</CardTitle>
                      <Badge className={activityTypeColors[activity.type]}>{activity.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(activity.startDate), "MMM d")} -{" "}
                        {format(new Date(activity.endDate), "MMM d, yyyy")}
                      </span>
                    </div>

                    {activity.type === "activity" && activity.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    )}

                    {activity.type === "activity" && activity.startTime && activity.endTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {activity.startTime} - {activity.endTime}
                        </span>
                      </div>
                    )}

                    {activity.budget && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>RM {activity.budget.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="flex -space-x-2">
                        {activity.friends.slice(0, 3).map((friend) => (
                          <Avatar key={friend.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                            <AvatarFallback className="text-xs">{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {activity.friends.length} {activity.friends.length === 1 ? "person" : "people"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <TripDetailModal
        activity={selectedActivity}
        friends={data.friends}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </div>
  )
}
