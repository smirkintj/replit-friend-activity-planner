"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import type { AppData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BusiestLeaderboardProps {
  data: AppData
  monthsAhead?: number
}

export function BusiestLeaderboard({ data, monthsAhead = 6 }: BusiestLeaderboardProps) {
  const leaderboard = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setMonth(endDate.getMonth() + monthsAhead)

    const friendActivityCounts = data.friends.map((friend) => {
      const activityCount = data.activities.filter((activity) => {
        const activityEnd = new Date(activity.endDate)
        const activityStart = new Date(activity.startDate)
        const isFriendInActivity = activity.friendId === friend.id || activity.friendIds?.includes(friend.id)
        return isFriendInActivity && activityEnd >= today && activityStart <= endDate
      }).length

      return {
        friend,
        activityCount,
      }
    })

    return friendActivityCounts.sort((a, b) => b.activityCount - a.activityCount).slice(0, 5)
  }, [data, monthsAhead])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 2:
        return "bg-gradient-to-r from-amber-500 to-amber-700 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="shadow-md border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Anugerah Terpaling Busy
        </CardTitle>
        <p className="text-xs text-muted-foreground">Who's got the most plans?</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {leaderboard.map(({ friend, activityCount }, index) => (
            <div
              key={friend.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                index < 3 ? "bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20" : "bg-muted/30",
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                    <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                      {friend.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 shadow-md">
                      {getRankIcon(index)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{friend.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activityCount} {activityCount === 1 ? "trip" : "trips"}
                  </p>
                </div>
              </div>
              <Badge className={cn("font-bold text-sm px-3 py-1", getRankBadge(index))}>#{index + 1}</Badge>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>No activities yet!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
