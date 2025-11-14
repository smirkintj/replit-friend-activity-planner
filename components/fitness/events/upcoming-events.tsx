"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, Users, Trophy } from "lucide-react"
import { format } from "date-fns"
import type { FitnessEventWithDetails, Friend } from "@/lib/types"
import { getLoggedInFriendId } from "@/lib/storage"

interface UpcomingEventsProps {
  friends: Friend[]
}

export function UpcomingEvents({ friends }: UpcomingEventsProps) {
  const [events, setEvents] = useState<FitnessEventWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const currentFriendId = getLoggedInFriendId()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/fitness-events?limit=5")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async (eventId: string, status: string) => {
    if (!currentFriendId) return

    try {
      const response = await fetch(`/api/fitness-events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: currentFriendId,
          rsvpStatus: status,
        }),
      })

      if (response.ok) {
        fetchEvents() // Refresh
      }
    } catch (error) {
      console.error("Failed to RSVP:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      run: "🏃",
      ride: "🚴",
      hike: "🥾",
      race: "🏁",
      swim: "🏊",
      other: "💪",
    }
    return icons[category] || "💪"
  }

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  if (events.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No upcoming fitness events</p>
          <p className="text-sm mt-2">Group workouts will appear here!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const myParticipation = event.participants.find(
          (p) => p.friendId === currentFriendId
        )
        const isOrganizer = event.activity.organizerId === currentFriendId

        return (
          <Card key={event.id} className="glass-card hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(event.eventCategory)}</span>
                    <CardTitle className="text-lg">{event.activity.title}</CardTitle>
                    {isOrganizer && (
                      <Badge variant="secondary" className="text-xs">
                        Organizer
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.activity.startDate), "MMM dd, yyyy")}
                      {event.activity.startTime && ` at ${event.activity.startTime}`}
                    </div>
                    {event.meetupLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.meetupLocation}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.goingCount} going
                      {event.maybeCount > 0 && `, ${event.maybeCount} maybe`}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={event.intensityLevel === "race" ? "destructive" : "outline"}
                  className="capitalize"
                >
                  {event.intensityLevel || "moderate"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {event.meetupNotes && (
                <p className="text-sm mb-4 text-muted-foreground">{event.meetupNotes}</p>
              )}

              {/* RSVP Buttons */}
              {currentFriendId && !isOrganizer && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={myParticipation?.rsvpStatus === "going" ? "default" : "outline"}
                    onClick={() => handleRSVP(event.id, "going")}
                    className="flex-1"
                  >
                    Going
                  </Button>
                  <Button
                    size="sm"
                    variant={myParticipation?.rsvpStatus === "maybe" ? "default" : "outline"}
                    onClick={() => handleRSVP(event.id, "maybe")}
                    className="flex-1"
                  >
                    Maybe
                  </Button>
                  <Button
                    size="sm"
                    variant={myParticipation?.rsvpStatus === "declined" ? "secondary" : "outline"}
                    onClick={() => handleRSVP(event.id, "declined")}
                    className="flex-1"
                  >
                    Can't Make It
                  </Button>
                </div>
              )}

              {/* Participants */}
              <div className="mt-4 flex -space-x-2">
                {event.participants.slice(0, 5).map((participant) => {
                  const friend = friends.find((f) => f.id === participant.friendId)
                  if (!friend) return null

                  return (
                    <Avatar
                      key={participant.id}
                      className="border-2 border-background w-8 h-8"
                      title={`${friend.name} - ${participant.rsvpStatus}`}
                    >
                      <AvatarImage src={friend.imageUrl} alt={friend.name} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                  )
                })}
                {event.participants.length > 5 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
                    +{event.participants.length - 5}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
