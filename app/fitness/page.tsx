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
import { StravaConnect } from "@/components/fitness/strava-connect"
import { FriendLogin } from "@/components/fitness/friend-login"
import type { Friend, FitnessActivity, LeaderboardEntry, FitnessBadge } from "@/lib/types"
import { getActivityIcon, getActivityColor } from "@/lib/fitness-points"
import { format, startOfWeek, addDays } from "date-fns"

export default function FitnessPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [weekSummary, setWeekSummary] = useState<any>(null)
  const [userBadges, setUserBadges] = useState<FitnessBadge[]>([])
  const [currentFriend, setCurrentFriend] = useState<Friend | null>(null)

  useEffect(() => {
    // Check if friend is logged in from session
    const storedFriendId = sessionStorage.getItem('fitness_friend_id')
    if (storedFriendId) {
      loadData(storedFriendId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = async (friend: Friend) => {
    setCurrentFriend(friend)
    await loadData(friend.id)
  }

  const loadData = async (friendId: string) => {
    try {
      setIsLoading(true)
      const data = await getStoredData()
      setFriends(data.friends)
      
      const friend = data.friends.find(f => f.id === friendId)
      if (friend) {
        setCurrentFriend(friend)
      }
      
      // Load fitness data
      await loadFitnessData(data.friends, friendId)
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setIsLoading(false)
    }
  }

  const loadFitnessData = async (friendList: Friend[], userId: string) => {
    try {
      const [leaderboardData, recentData, summary, badges] = await Promise.all([
        getWeeklyLeaderboard(friendList),
        getRecentActivities(15),
        getWeekSummary(userId),
        getFitnessBadges(userId)
      ])
      
      setLeaderboard(leaderboardData)
      setRecentActivities(recentData)
      setWeekSummary(summary)
      setUserBadges(badges)
    } catch (error) {
      console.error("Error loading fitness data:", error)
    }
  }

  const handleAddWorkout = async (activity: Omit<FitnessActivity, "id" | "createdAt" | "points">) => {
    await addFitnessActivity(activity)
    if (currentFriend) {
      await loadFitnessData(friends, currentFriend.id)
    }
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

  // Show login screen if not authenticated
  if (!currentFriend && !isLoading) {
    return <FriendLogin onLogin={handleLogin} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)' }}>
        <div className="text-center">
          <div className="h-16 w-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
               style={{ borderColor: 'rgba(139, 92, 246, 0.3)', borderTopColor: '#8b5cf6' }} />
          <p className="text-lg font-medium text-white">Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-lg border-b"
              style={{ 
                background: 'rgba(10, 14, 39, 0.8)',
                borderColor: 'rgba(139, 92, 246, 0.2)'
              }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg relative"
                     style={{
                       background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                       boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                     }}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    <span style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>FitSquad</span>
                  </h1>
                  <p className="text-sm text-gray-400">Track, compete, achieve</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowWorkoutForm(true)} 
              className="gap-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
              }}>
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
              currentFriendId={currentFriend?.id || ""}
            />
          </div>
        )}

        {weekSummary && currentFriend && (
          <Card className="backdrop-blur-lg border overflow-hidden"
                style={{
                  background: 'rgba(15, 20, 45, 0.6)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
                }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2"
                          style={{ borderColor: '#8b5cf6' }}>
                    <AvatarImage src={currentFriend.imageUrl} />
                    <AvatarFallback style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
                      {currentFriend.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-white">
                    💪 {currentFriend.name.toUpperCase()}'S WEEK
                  </h2>
                </div>
                <Badge variant="secondary" className="gap-1 px-3 py-1 text-white border-0"
                       style={{
                         background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                         boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
                       }}>
                  <Flame className="h-3 w-3" />
                  {weekSummary.streak} day streak
                </Badge>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">{day.day}</div>
                    <div
                      className={`
                        w-full aspect-square rounded-full flex items-center justify-center text-lg font-bold
                        transition-all duration-200
                        ${day.hasWorkout
                          ? "text-white border-2"
                          : "text-gray-500 border border-gray-700"
                        }
                      `}
                      style={day.hasWorkout ? {
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        borderColor: '#a78bfa',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)'
                      } : {}}
                    >
                      {day.hasWorkout ? "✅" : day.date}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg backdrop-blur-sm"
                     style={{ 
                       background: 'rgba(139, 92, 246, 0.1)',
                       border: '1px solid rgba(139, 92, 246, 0.2)'
                     }}>
                  <div className="text-3xl font-bold text-white">{weekSummary.totalPoints}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">points</div>
                </div>
                <div className="p-4 rounded-lg backdrop-blur-sm"
                     style={{ 
                       background: 'rgba(139, 92, 246, 0.1)',
                       border: '1px solid rgba(139, 92, 246, 0.2)'
                     }}>
                  <div className="text-3xl font-bold text-white">{weekSummary.totalWorkouts}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">workouts</div>
                </div>
                <div className="p-4 rounded-lg backdrop-blur-sm"
                     style={{ 
                       background: 'rgba(139, 92, 246, 0.1)',
                       border: '1px solid rgba(139, 92, 246, 0.2)'
                     }}>
                  <div className="text-3xl font-bold text-white">
                    {weekSummary.totalDistance.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">km</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentFriend && (
          <StravaConnect
            friendId={currentFriend.id}
            friendName={currentFriend.name}
          />
        )}

        <Leaderboard entries={leaderboard} />

        {userBadges && (
          <BadgeGallery unlockedBadges={userBadges} />
        )}

        <Card className="backdrop-blur-lg border overflow-hidden"
              style={{
                background: 'rgba(15, 20, 45, 0.6)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
              }}>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4 text-white">📊 RECENT ACTIVITY</h2>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No activities yet!</p>
                  <p className="text-sm mt-2">Be the first to log a workout 💪</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} 
                       className="p-4 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-[1.02]"
                       style={{
                         background: 'rgba(139, 92, 246, 0.08)',
                         border: '1px solid rgba(139, 92, 246, 0.2)'
                       }}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2"
                              style={{ borderColor: '#6366f1' }}>
                        <AvatarImage src={activity.friendImageUrl} />
                        <AvatarFallback style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
                          {activity.friendName.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">
                          <span style={{ 
                            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>{activity.friendName}</span> completed a {activity.type}!
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{getActivityIcon(activity.type)}</span>
                          {activity.distance && <span>{activity.distance}km</span>}
                          <span>• {activity.duration}min</span>
                          <span>• {format(new Date(activity.date), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>

                      <Badge className="text-white border-0 px-3 py-1"
                             style={{
                               background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                               boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
                             }}>
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
