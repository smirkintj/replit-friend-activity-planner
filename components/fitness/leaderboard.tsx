"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LeaderboardEntry } from "@/lib/types"
import { Trophy, Flame, Award } from "lucide-react"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  title?: string
}

export function Leaderboard({ entries, title = "🏆 THIS WEEK'S CHAMPIONS" }: LeaderboardProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.5)',
          boxShadow: '0 0 25px rgba(251, 191, 36, 0.3)'
        }
      case 2:
        return {
          background: 'rgba(148, 163, 184, 0.1)',
          border: '2px solid rgba(148, 163, 184, 0.4)',
          boxShadow: '0 0 20px rgba(148, 163, 184, 0.2)'
        }
      case 3:
        return {
          background: 'rgba(251, 146, 60, 0.1)',
          border: '2px solid rgba(251, 146, 60, 0.4)',
          boxShadow: '0 0 20px rgba(251, 146, 60, 0.2)'
        }
      default:
        return {
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <div className="text-3xl">🥇</div>
      case 2:
        return <div className="text-3xl">🥈</div>
      case 3:
        return <div className="text-3xl">🥉</div>
      default:
        return <div className="text-xl font-bold text-gray-400">{rank}</div>
    }
  }

  const getStreakEmojis = (streak: number) => {
    if (streak >= 7) return "⚡⚡⚡⚡⚡"
    if (streak >= 5) return "⚡⚡⚡⚡"
    if (streak >= 3) return "⚡⚡⚡"
    if (streak >= 1) return "⚡"
    return ""
  }

  const champion = entries[0]
  // Filter out entries with 0 points from the rest of the leaderboard
  const otherEntries = entries.slice(1).filter(entry => {
    const points = Number(entry.points)
    return !isNaN(points) && points > 0
  })

  if (entries.length === 0) {
    return (
      <Card className="backdrop-blur-lg border overflow-hidden"
            style={{
              background: 'rgba(15, 20, 45, 0.6)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
            }}>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-400">
            <p>No workouts yet this week!</p>
            <p className="text-sm mt-2">Be the first to log a workout 💪</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Champion Spotlight - Side Panel */}
      <Card className="backdrop-blur-lg border overflow-hidden lg:col-span-1"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
              borderColor: 'rgba(251, 191, 36, 0.5)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
            }}>
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <Trophy className="h-12 w-12 mx-auto mb-2"
                    style={{ color: '#fbbf24' }} />
            <h3 className="text-lg font-bold text-white">TERPALING FIT 🔥</h3>
            <div className="text-6xl my-4">👑</div>
          </div>

          <Avatar className="h-24 w-24 border-4 mx-auto mb-4"
                  style={{ borderColor: '#fbbf24' }}>
            <AvatarImage src={champion.friendImageUrl} alt={champion.friendName} />
            <AvatarFallback style={{ 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              fontSize: '2rem'
            }}>
              {champion.friendName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-white">{champion.friendName}</h2>
            {champion.stravaConnected && (
              <Badge variant="secondary" className="text-xs border-0 px-2 py-0.5 text-white"
                     style={{
                       background: 'linear-gradient(135deg, #fc4c02 0%, #e34402 100%)',
                       boxShadow: '0 0 10px rgba(252, 76, 2, 0.3)'
                     }}>
                ✓ Strava
              </Badge>
            )}
          </div>

          {champion.stravaConnected && champion.stravaAthleteId && (
            <a
              href={`https://www.strava.com/athletes/${champion.stravaAthleteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-400 hover:text-orange-300 mb-4 inline-block"
            >
              View Strava Profile →
            </a>
          )}
          
          <div className="mb-4">
            <div className="text-5xl font-bold text-yellow-400">{champion.points}</div>
            <div className="text-sm text-gray-300 uppercase tracking-wider">points</div>
          </div>

          {/* Desktop only: Detailed stats */}
          <div className="hidden md:block space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 rounded"
                 style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
              <span className="text-gray-300">Workouts</span>
              <span className="text-white font-bold">{champion.workouts}</span>
            </div>
            {champion.calories > 0 && (
              <div className="flex justify-between items-center p-2 rounded"
                   style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                <span className="text-gray-300">Calories Burned</span>
                <span className="text-white font-bold">{champion.calories.toLocaleString()} kcal</span>
              </div>
            )}
            <div className="flex justify-between items-center p-2 rounded"
                 style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
              <span className="text-gray-300">Streak</span>
              <span className="text-white font-bold">{champion.streak} days 🔥</span>
            </div>
            {champion.badges > 0 && (
              <div className="flex justify-between items-center p-2 rounded"
                   style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                <span className="text-gray-300">Badges</span>
                <span className="text-white font-bold">{champion.badges} 🏅</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of Leaderboard */}
      <Card className="backdrop-blur-lg border overflow-hidden lg:col-span-2"
            style={{
              background: 'rgba(15, 20, 45, 0.6)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
            }}>
        <CardHeader>
          <CardTitle className="text-white">🏅 Anugerah Terpaling Sihat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {otherEntries.map((entry) => {
            const content = (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-12 w-12 border-2"
                        style={{ borderColor: entry.rank <= 3 ? '#8b5cf6' : '#4b5563' }}>
                  <AvatarImage src={entry.friendImageUrl} alt={entry.friendName} />
                  <AvatarFallback style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                  }}>
                    {entry.friendName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base md:text-lg text-white">{entry.friendName}</h3>
                    {entry.stravaConnected && (
                      <Badge variant="secondary" className="text-xs border-0 px-2 py-0.5 text-white"
                             style={{
                               background: 'linear-gradient(135deg, #fc4c02 0%, #e34402 100%)',
                               boxShadow: '0 0 10px rgba(252, 76, 2, 0.3)'
                             }}>
                        ✓ Strava
                      </Badge>
                    )}
                  </div>
                  {/* Desktop only: Detailed stats */}
                  <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                    <span>{entry.workouts} workouts</span>
                    {entry.distance > 0 && <span>• {entry.distance.toFixed(1)}km</span>}
                    {entry.streak > 0 && (
                      <span className="flex items-center gap-1">
                        • <Flame className="h-3 w-3 text-orange-400" /> {entry.streak} days
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {entry.points}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">pts</div>
                </div>
              </div>
            )

            return (
              <div
                key={entry.friendId}
                className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={getRankStyle(entry.rank)}
              >
                {entry.stravaConnected && entry.stravaAthleteId ? (
                  <a
                    href={`https://www.strava.com/athletes/${entry.stravaAthleteId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
