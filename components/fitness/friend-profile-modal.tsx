"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Flame, Award, TrendingUp, Calendar, Zap } from "lucide-react"
import type { Friend, LeaderboardEntry } from "@/lib/types"
import { getFitnessActivities } from "@/lib/fitness-storage"
import { calculateCurrentStreak } from "@/lib/fitness-points"
import { getCurrentStreakTier } from "@/lib/streak-tiers"
import { StreakTierBadge } from "./streak-tier-badge"

interface FriendProfileModalProps {
  friend: Friend | null
  leaderboardEntry: LeaderboardEntry | null
  isOpen: boolean
  onClose: () => void
}

export function FriendProfileModal({ friend, leaderboardEntry, isOpen, onClose }: FriendProfileModalProps) {
  const [totalActivities, setTotalActivities] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalDistance, setTotalDistance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (friend && isOpen) {
      loadStats()
    }
  }, [friend, isOpen])

  const loadStats = async () => {
    if (!friend) return
    
    setIsLoading(true)
    try {
      const activities = await getFitnessActivities(friend.id)
      
      setTotalActivities(activities.length)
      setTotalPoints(activities.reduce((sum, a) => sum + a.points, 0))
      setTotalDistance(activities.filter(a => a.distance).reduce((sum, a) => sum + (a.distance || 0), 0))
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!friend || !leaderboardEntry) return null

  const tier = getCurrentStreakTier(leaderboardEntry.streak)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg backdrop-blur-xl border-0 max-h-[90vh] overflow-y-auto"
                     style={{
                       background: 'rgba(15, 20, 45, 0.95)',
                       boxShadow: '0 0 50px rgba(139, 92, 246, 0.3)'
                     }}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-white">Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-gray-400">
            <div className="inline-block h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading stats...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile Header - Compact */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <Avatar className="h-16 w-16 border-4"
                        style={{ borderColor: tier.color }}>
                  <AvatarImage src={friend.imageUrl} alt={friend.name} />
                  <AvatarFallback style={{ 
                    background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}cc 100%)`,
                    fontSize: '1.5rem'
                  }}>
                    {friend.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {leaderboardEntry.rank <= 3 && (
                  <div className="absolute -top-1 -right-1">
                    {leaderboardEntry.rank === 1 && <span className="text-2xl">🥇</span>}
                    {leaderboardEntry.rank === 2 && <span className="text-2xl">🥈</span>}
                    {leaderboardEntry.rank === 3 && <span className="text-2xl">🥉</span>}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-2xl font-bold text-white truncate">{friend.name}</h2>
                  {leaderboardEntry.stravaConnected && (
                    <Badge variant="secondary" className="text-xs border-0 px-2 py-0.5 text-white flex-shrink-0"
                           style={{
                             background: 'linear-gradient(135deg, #fc4c02 0%, #e34402 100%)',
                             boxShadow: '0 0 10px rgba(252, 76, 2, 0.3)'
                           }}>
                      ✓ Strava
                    </Badge>
                  )}
                </div>
                {friend.quote && (
                  <p className="text-gray-400 italic text-xs mb-1.5 line-clamp-1">"{friend.quote}"</p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="gap-1 px-2 py-0.5 border-0 text-white"
                         style={{
                           background: leaderboardEntry.rank === 1 
                             ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                             : 'rgba(139, 92, 246, 0.4)'
                         }}>
                    {leaderboardEntry.rank === 1 ? '👑' : `#${leaderboardEntry.rank}`}
                  </Badge>
                  <span className="text-gray-400">
                    🔥 {leaderboardEntry.streak} day streak
                  </span>
                </div>
              </div>
            </div>

            {/* This Week Stats */}
            <Card className="backdrop-blur-lg border overflow-hidden"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }}>
              <CardContent className="pt-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  This Week
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2.5 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <div className="text-2xl font-bold text-purple-400">{leaderboardEntry.points}</div>
                    <div className="text-xs text-gray-400 uppercase mt-0.5">Points</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <div className="text-2xl font-bold text-blue-400">{leaderboardEntry.workouts}</div>
                    <div className="text-xs text-gray-400 uppercase mt-0.5">Workouts</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <div className="text-2xl font-bold text-green-400">
                      {leaderboardEntry.distance > 0 ? leaderboardEntry.distance.toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-gray-400 uppercase mt-0.5">km</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <div className="text-2xl font-bold text-amber-400">
                      {leaderboardEntry.calories > 0 ? leaderboardEntry.calories.toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-gray-400 uppercase mt-0.5">kcal</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All-Time Stats - Compact Single Row */}
            <Card className="backdrop-blur-lg border overflow-hidden"
                  style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderColor: 'rgba(251, 191, 36, 0.3)'
                  }}>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  All-Time
                </h3>
                <div className="flex items-center justify-around gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{totalPoints}</div>
                    <div className="text-xs text-gray-500 uppercase">Points</div>
                  </div>
                  <div className="h-8 w-px bg-gray-700" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{totalActivities}</div>
                    <div className="text-xs text-gray-500 uppercase">Activities</div>
                  </div>
                  <div className="h-8 w-px bg-gray-700" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">
                      {totalDistance > 0 ? totalDistance.toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">Total km</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* View Strava Link */}
            {leaderboardEntry.stravaConnected && leaderboardEntry.stravaAthleteId && (
              <a
                href={`https://www.strava.com/athletes/${leaderboardEntry.stravaAthleteId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 px-4 rounded-lg font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #fc4c02 0%, #e34402 100%)',
                  boxShadow: '0 4px 20px rgba(252, 76, 2, 0.4)'
                }}
              >
                View Strava Profile →
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
