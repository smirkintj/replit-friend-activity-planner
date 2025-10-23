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
  getRecentActivities,
  getWeeklyChallenges
} from "@/lib/fitness-storage"
import { WorkoutForm } from "@/components/fitness/workout-form"
import { Leaderboard } from "@/components/fitness/leaderboard"
import { BadgeGallery } from "@/components/fitness/badge-gallery"
import { StravaConnect } from "@/components/fitness/strava-connect"
import { StravaProfile } from "@/components/fitness/strava-profile"
import { FriendLogin } from "@/components/fitness/friend-login"
import { WeeklyChallenges } from "@/components/fitness/weekly-challenges"
import { FoodCalories } from "@/components/fitness/food-calories"
import { ActivityDetailModal } from "@/components/fitness/activity-detail-modal"
import { StreakTierExplainer } from "@/components/fitness/streak-tier-explainer"
import { StreakAvatar } from "@/components/fitness/streak-name-display"
import { StreakTierBadge } from "@/components/fitness/streak-tier-badge"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import type { Friend, FitnessActivity, LeaderboardEntry, FitnessBadge, WeeklyChallenge } from "@/lib/types"
import { getActivityIcon, getActivityColor } from "@/lib/fitness-points"
import { format, startOfWeek, addDays } from "date-fns"
import { getCurrentStreakTier, getNextStreakTier, getDaysUntilNextTier } from "@/lib/streak-tiers"

export default function FitnessPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [weekSummary, setWeekSummary] = useState<any>(null)
  const [userBadges, setUserBadges] = useState<FitnessBadge[]>([])
  const [currentFriend, setCurrentFriend] = useState<Friend | null>(null)
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([])
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

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
      
      // Calculate challenges from the already-fetched summary (no redundant query)
      const challenges = getWeeklyChallenges(summary)
      
      setLeaderboard(leaderboardData)
      setRecentActivities(recentData)
      setWeekSummary(summary)
      setUserBadges(badges)
      setWeeklyChallenges(challenges)
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

        {currentFriend && (
          <div className="space-y-4">
            <StravaConnect
              friendId={currentFriend.id}
              friendName={currentFriend.name}
            />
            <StravaProfile
              friendId={currentFriend.id}
              friendName={currentFriend.name}
            />
          </div>
        )}

        {weekSummary && currentFriend && (
          <div className="space-y-4">
            {/* Competitive Stats Card */}
            <Card className="backdrop-blur-lg border overflow-hidden"
                  style={{
                    background: 'rgba(15, 20, 45, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
                  }}>
              <CardContent className="pt-6">
                {/* Header with Rank - Mobile Responsive */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <StreakAvatar
                      src={currentFriend.imageUrl}
                      name={currentFriend.name}
                      streakDays={weekSummary.streak}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                        {currentFriend.name.toUpperCase()}'S WEEK
                      </h2>
                      {(() => {
                        const userEntry = leaderboard.find(e => e.friendId === currentFriend.id)
                        const leader = leaderboard[0]
                        const pointsBehind = leader && userEntry ? leader.points - userEntry.points : 0
                        
                        return userEntry && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge className="gap-1 px-2 py-0.5 text-xs border-0 text-white flex-shrink-0"
                                   style={{
                                     background: userEntry.rank === 1 
                                       ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                       : 'rgba(139, 92, 246, 0.3)'
                                   }}>
                              {userEntry.rank === 1 ? '👑' : `#${userEntry.rank}`} RANK {userEntry.rank}
                            </Badge>
                            {pointsBehind > 0 && (
                              <span className="text-xs text-gray-400 hidden sm:inline">
                                {pointsBehind} pts behind leader
                              </span>
                            )}
                            {userEntry.rank === 1 && (
                              <span className="text-xs text-yellow-400">
                                🔥 Crushing it!
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  
                  {/* Streak Tier Badge */}
                  <div className="md:flex-shrink-0">
                    <StreakTierBadge streakDays={weekSummary.streak} />
                  </div>
                </div>

                {/* Weekly Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300">Weekly Activity</span>
                    <span className="text-sm text-gray-400">{weekDays.filter(d => d.hasWorkout).length}/7 days</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-xs text-center text-gray-400 font-medium">{day.day}</div>
                        <div
                          className="h-20 rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
                          style={day.hasWorkout ? {
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)'
                          } : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px dashed rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {day.hasWorkout ? (
                            <div className="text-center">
                              <div className="text-2xl mb-1">💪</div>
                              <div className="text-xs text-white font-bold">{day.date}</div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-xl text-gray-600">{day.date}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Stats - Mobile Responsive Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 rounded-xl backdrop-blur-sm text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                         border: '2px solid rgba(139, 92, 246, 0.4)',
                         boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
                       }}>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{weekSummary.totalPoints}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider font-semibold">Points</div>
                  </div>
                  <div className="p-3 md:p-4 rounded-xl backdrop-blur-sm text-center"
                       style={{ 
                         background: 'rgba(251, 146, 60, 0.15)',
                         border: '2px solid rgba(251, 146, 60, 0.3)'
                       }}>
                    <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">{weekSummary.totalCalories || 0}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider font-semibold">Calories</div>
                  </div>
                  <div className="p-3 md:p-4 rounded-xl backdrop-blur-sm text-center"
                       style={{ 
                         background: 'rgba(139, 92, 246, 0.1)',
                         border: '1px solid rgba(139, 92, 246, 0.2)'
                       }}>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{weekSummary.totalWorkouts}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider font-semibold">Workouts</div>
                  </div>
                  <div className="p-3 md:p-4 rounded-xl backdrop-blur-sm text-center"
                       style={{ 
                         background: 'rgba(139, 92, 246, 0.1)',
                         border: '1px solid rgba(139, 92, 246, 0.2)'
                       }}>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{weekSummary.totalDistance.toFixed(1)}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider font-semibold">km</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Point System Explainer - Collapsible */}
            <CollapsibleSection
              title="HOW POINTS WORK"
              icon="💡"
              defaultOpen={false}
              style={{
                background: 'rgba(15, 20, 45, 0.4)',
                borderColor: 'rgba(139, 92, 246, 0.2)'
              }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-mono text-xs">10pts/km</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-xs">Run, Bike, Walk, Hike, Swim</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-mono text-xs">5pts/10min</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-xs">Gym, Strength</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-mono text-xs">3pts/10min</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-xs">Yoga, Other</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-mono text-xs">+Streak</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-xs">Daily workout bonus!</span>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        <Leaderboard entries={leaderboard} />

        {weeklyChallenges.length > 0 && (
          <WeeklyChallenges challenges={weeklyChallenges} />
        )}

        <CollapsibleSection
          title="🍽️ MALAYSIAN FOOD CALORIE GUIDE"
          defaultOpen={false}
          style={{
            background: 'rgba(15, 20, 45, 0.6)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
          }}>
          <FoodCalories />
        </CollapsibleSection>

        {currentFriend && weekSummary && (
          <CollapsibleSection
            title="🏆 STREAK TIER REWARDS"
            defaultOpen={false}
            style={{
              background: 'rgba(15, 20, 45, 0.6)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
            }}>
            <StreakTierExplainer currentStreakDays={weekSummary.streak} />
          </CollapsibleSection>
        )}

        {userBadges && (
          <CollapsibleSection
            title="🎖️ ACHIEVEMENT BADGES"
            defaultOpen={false}
            style={{
              background: 'rgba(15, 20, 45, 0.6)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
            }}>
            <BadgeGallery unlockedBadges={userBadges} />
          </CollapsibleSection>
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
                       className="p-4 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                       onClick={() => setSelectedActivity(activity)}
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

        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      </main>
    </div>
  )
}
