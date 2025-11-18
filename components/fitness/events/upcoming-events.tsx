"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, Users, Trophy, Info } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
      // Viewing events is public - no auth required
      const response = await fetch("/api/fitness-events?limit=5")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error("Failed to fetch events:", response.status, response.statusText)
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
      // Get friend PIN for authentication
      const friendPin = sessionStorage.getItem('fitness_friend_pin')
      if (!friendPin) {
        console.error("No authentication found")
        return
      }

      const response = await fetch(`/api/fitness-events/${eventId}/rsvp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-pin": friendPin
        },
        body: JSON.stringify({
          rsvpStatus: status,
        }),
      })

      if (response.ok) {
        fetchEvents() // Refresh
      } else {
        console.error("RSVP failed:", response.status)
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
          
          {/* Help Info */}
          <div className="mt-4 pt-4 border-t border-border">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Info className="w-4 h-4" />
                  How to create fitness events?
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-card" align="center">
                <div className="space-y-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    Creating Group Fitness Events
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-purple-400 font-bold">1.</span>
                      <div>
                        <p className="font-medium">Run the database migration</p>
                        <p className="text-xs text-muted-foreground">Open your Supabase dashboard → SQL Editor → paste the code from <code>supabase-fitness-events-schema.sql</code> → Run it</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="text-purple-400 font-bold">2.</span>
                      <div>
                        <p className="font-medium">Go to Admin Panel</p>
                        <p className="text-xs text-muted-foreground">Navigate to <code>/admin</code> and login with your superadmin PIN</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="text-purple-400 font-bold">3.</span>
                      <div>
                        <p className="font-medium">Create a trip with type "fitness_event"</p>
                        <p className="text-xs text-muted-foreground">Fill in the event details (meetup location, date, intensity). Everyone who RSVPs "Going" gets added to the event!</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="text-orange-400 font-bold">✨</span>
                      <div>
                        <p className="font-medium">Bonus Points!</p>
                        <p className="text-xs text-muted-foreground">Friends who attend and log their Strava workout get +50 bonus points automatically linked to the event!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
