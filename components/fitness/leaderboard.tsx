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

  return (
    <Card className="backdrop-blur-lg border overflow-hidden"
          style={{
            background: 'rgba(15, 20, 45, 0.6)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
          }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-6 w-6"
                  style={{ color: '#fbbf24' }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No workouts yet this week!</p>
            <p className="text-sm mt-2">Be the first to log a workout 💪</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.friendId}
              className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={getRankStyle(entry.rank)}
            >
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
                    <h3 className="font-semibold text-lg text-white">{entry.friendName}</h3>
                    {entry.rank === 1 && (
                      <Badge className="border-0 text-white px-2 py-0.5"
                             style={{
                               background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                               boxShadow: '0 0 15px rgba(251, 191, 36, 0.5)'
                             }}>
                        LEADER
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{entry.workouts} workouts</span>
                    {entry.distance > 0 && <span>• {entry.distance.toFixed(1)}km</span>}
                    {entry.streak > 0 && (
                      <span className="flex items-center gap-1">
                        • <Flame className="h-3 w-3 text-orange-400" /> {entry.streak} day streak
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${entry.rank <= 3 ? "text-white" : "text-gray-300"}`}>
                    {entry.points}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">points</div>
                  <div className="mt-1">{getStreakEmojis(entry.streak)}</div>
                </div>
              </div>

              {entry.badges > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-400 border-t pt-2"
                     style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                  <Award className="h-4 w-4" />
                  <span>{entry.badges} badge{entry.badges !== 1 ? "s" : ""} unlocked</span>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
