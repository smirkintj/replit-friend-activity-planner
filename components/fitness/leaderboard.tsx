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
        return "rainbow-border glow-primary bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20"
      case 2:
        return "border-2 border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20"
      case 3:
        return "border-2 border-amber-600 dark:border-amber-700 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
      default:
        return "glass-card"
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
        return <div className="text-xl font-bold text-muted-foreground">{rank}</div>
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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workouts yet this week!</p>
            <p className="text-sm mt-2">Be the first to log a workout 💪</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.friendId}
              className={`p-4 rounded-xl transition-all hover-lift ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-12 w-12">
                  <AvatarImage src={entry.friendImageUrl} alt={entry.friendName} />
                  <AvatarFallback>{entry.friendName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{entry.friendName}</h3>
                    {entry.rank === 1 && <Badge className="badge-gold">LEADER</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{entry.workouts} workouts</span>
                    {entry.distance > 0 && <span>• {entry.distance.toFixed(1)}km</span>}
                    {entry.streak > 0 && (
                      <span className="flex items-center gap-1">
                        • <Flame className="h-3 w-3 text-orange-500" /> {entry.streak} day streak
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${entry.rank <= 3 ? "gradient-text" : ""}`}>
                    {entry.points}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                  <div className="mt-1">{getStreakEmojis(entry.streak)}</div>
                </div>
              </div>

              {entry.badges > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
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
