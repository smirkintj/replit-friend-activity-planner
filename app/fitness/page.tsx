"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Plus, Flame, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { getStoredData } from "@/lib/storage"
import {
  getFitnessActivities,
  addFitnessActivity,
  getFitnessBadges,
  getWeeklyLeaderboard,
  getWeekSummary,
  getRecentActivities
} from "@/lib/fitness-storage"
import { WorkoutForm } from "@/components/fitness/workout-form"
import { Leaderboard } from "@/components/fitness/leaderboard"
import { BadgeGallery } from "@/components/fitness/badge-gallery"
import type { Friend, FitnessActivity, LeaderboardEntry, FitnessBadge } from "@/lib/types"
import { getActivityIcon, getActivityColor } from "@/lib/fitness-points"
import { format, startOfWeek, addDays } from "date-fns"
import { getLoggedInFriendId } from "@/lib/storage"

export default function FitnessPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [weekSummary, setWeekSummary] = useState<any>(null)
  const [userBadges, setUserBadges] = useState<FitnessBadge[]>([])
  const [currentFriendId, setCurrentFriendId] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await getStoredData()
      setFriends(data.friends)
      
      // Get logged in friend ID
      const loggedInId = getLoggedInFriendId()
      if (loggedInId) {
        setCurrentFriendId(loggedInId)
      } else {
        // Default to first friend if not logged in
        setCurrentFriendId(data.friends[0]?.id || "")
      }
      
      // Load fitness data
      await loadFitnessData(data.friends)
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setIsLoading(false)
    }
  }

  const loadFitnessData = async (friendList: Friend[]) => {
    try {
      const [leaderboardData, recentData] = await Promise.all([
        getWeeklyLeaderboard(friendList),
        getRecentActivities(15)
      ])
      
      setLeaderboard(leaderboardData)
      setRecentActivities(recentData)

      // Load current user's data
      const loggedInId = getLoggedInFriendId()
      if (loggedInId || friendList.length > 0) {
        const userId = loggedInId || friendList[0]?.id
        if (userId) {
          const [summary, badges] = await Promise.all([
            getWeekSummary(userId),
            getFitnessBadges(userId)
          ])
          setWeekSummary(summary)
          setUserBadges(badges)
        }
      }
    } catch (error) {
      console.error("Error loading fitness data:", error)
    }
  }

  const handleAddWorkout = async (activity: Omit<FitnessActivity, "id" | "createdAt" | "points">) => {
    await addFitnessActivity(activity)
    await loadFitnessData(friends)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
    const dateKey = format(date, 'yyyy-MM-dd')
    const hasWorkout = weekSummary?.dailyActivities?.[dateKey]?.length > 0
    return {
      day: format(date, 'EEE'),
      date: format(date, 'd'),
      hasWorkout
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4 glow-primary" />
          <p className="text-lg font-medium gradient-text">Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg glow-primary animate-bounce-subtle">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">FitSquad</h1>
                  <p className="text-sm text-muted-foreground">Track, compete, achieve</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowWorkoutForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Log Workout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {showWorkoutForm && (
          <div className="animate-bounce-subtle">
            <WorkoutForm
              friends={friends}
              onSubmit={handleAddWorkout}
              onClose={() => setShowWorkoutForm(false)}
              currentFriendId={currentFriendId}
            />
          </div>
        )}

        {weekSummary && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold gradient-text">💪 YOUR WEEK</h2>
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {weekSummary.streak} day streak
                </Badge>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                    <div
                      className={`
                        w-full aspect-square rounded-full flex items-center justify-center text-lg
                        ${day.hasWorkout
                          ? "bg-gradient-to-br from-primary to-secondary glow-primary text-white"
                          : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {day.hasWorkout ? "✅" : day.date}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold gradient-text">{weekSummary.totalPoints}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">{weekSummary.totalWorkouts}</div>
                  <div className="text-xs text-muted-foreground">workouts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">
                    {weekSummary.totalDistance.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">km</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Leaderboard entries={leaderboard} />

        {userBadges && (
          <BadgeGallery unlockedBadges={userBadges} />
        )}

        <Card className="glass-card">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold gradient-text mb-4">📊 Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No activities yet!</p>
                  <p className="text-sm mt-2">Be the first to log a workout 💪</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="glass-card p-4 hover-lift transition-all">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activity.friendImageUrl} />
                        <AvatarFallback>{activity.friendName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          <span className="gradient-text">{activity.friendName}</span> completed a {activity.type}!
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{getActivityIcon(activity.type)}</span>
                          {activity.distance && <span>{activity.distance}km</span>}
                          <span>• {activity.duration}min</span>
                          <span>• {format(new Date(activity.date), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>

                      <Badge className={`bg-gradient-to-r ${getActivityColor(activity.type)} text-white border-0`}>
                        +{activity.points} pts
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
