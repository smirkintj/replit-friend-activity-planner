"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Filter, Crown, Search, X, Instagram } from "lucide-react"
import type { Activity, Friend, AppData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { JoinRequestModal } from "@/components/join-request-modal"

interface FriendActivities {
  friend: Friend
  activities: Activity[]
}

interface AvailabilityOverviewProps {
  data: AppData
  monthsAhead?: number
}

export function AvailabilityOverview({ data, monthsAhead = 6 }: AvailabilityOverviewProps) {
  const [selectedFriend, setSelectedFriend] = useState<FriendActivities | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const overview = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setMonth(endDate.getMonth() + monthsAhead)

    const filterStart = dateRange.from || today
    const filterEnd = dateRange.to || endDate

    const friendActivities: FriendActivities[] = data.friends
      .filter((friend) => {
        const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGroup =
          selectedGroupIds.length === 0 || friend.groupIds.some((gid) => selectedGroupIds.includes(gid))
        return matchesSearch && matchesGroup
      })
      .map((friend) => {
        const activities = data.activities
          .filter((activity) => {
            const activityEnd = new Date(activity.endDate)
            const activityStart = new Date(activity.startDate)
            const isFriendInActivity = activity.friendId === friend.id || activity.friendIds?.includes(friend.id)
            return isFriendInActivity && activityEnd >= filterStart && activityStart <= filterEnd
          })
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

        return {
          friend,
          activities,
        }
      })

    return friendActivities.sort((a, b) => a.friend.name.localeCompare(b.friend.name))
  }, [data, monthsAhead, dateRange, searchQuery, selectedGroupIds])

  const totalActivities = overview.reduce((sum, f) => sum + f.activities.length, 0)

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined })
  }

  const toggleGroupFilter = (groupId: string) => {
    setSelectedGroupIds((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedGroupIds([])
    clearDateFilter()
  }

  const hasActiveFilters = searchQuery || selectedGroupIds.length > 0 || dateRange.from || dateRange.to

  const handleRequestJoin = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowJoinRequestModal(true)
  }

  return (
    <>
      <Card className="shadow-sm border">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">Who's Busy?</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-40 h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-2", selectedGroupIds.length > 0 && "border-primary bg-primary/5")}
                  >
                    <Filter className="h-4 w-4" />
                    Groups {selectedGroupIds.length > 0 && `(${selectedGroupIds.length})`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Filter by Group</h4>
                    <div className="space-y-2">
                      {data.groups.map((group) => (
                        <div key={group.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={selectedGroupIds.includes(group.id)}
                            onCheckedChange={() => toggleGroupFilter(group.id)}
                          />
                          <label
                            htmlFor={`group-${group.id}`}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
                            <span className="text-sm">{group.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedGroupIds.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGroupIds([])}
                        className="w-full bg-transparent"
                      >
                        Clear Groups
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-2", (dateRange.from || dateRange.to) && "border-primary bg-primary/5")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.from || dateRange.to ? "Filtered" : "Dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Date</label>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To Date</label>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                      />
                    </div>
                    {(dateRange.from || dateRange.to) && (
                      <Button variant="outline" size="sm" onClick={clearDateFilter} className="w-full bg-transparent">
                        Clear Dates
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Badge variant="secondary" className="font-semibold">
                {totalActivities} trips
              </Badge>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && <Badge variant="outline">Search: {searchQuery}</Badge>}
              {selectedGroupIds.length > 0 && (
                <Badge variant="outline">
                  {selectedGroupIds.length} group{selectedGroupIds.length > 1 ? "s" : ""}
                </Badge>
              )}
              {(dateRange.from || dateRange.to) && (
                <Badge variant="outline">
                  {dateRange.from ? format(dateRange.from, "MMM d") : "start"} -{" "}
                  {dateRange.to ? format(dateRange.to, "MMM d") : "end"}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {overview.map(({ friend, activities }) => {
              const nextActivity = activities[0]
              const remainingCount = activities.length - 1

              return (
                <button
                  key={friend.id}
                  onClick={() => activities.length > 0 && setSelectedFriend({ friend, activities })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                    activities.length > 0
                      ? "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:border-destructive hover:shadow-md cursor-pointer"
                      : "bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:border-accent/30",
                  )}
                >
                  <div className="relative">
                    {friend.isOwner && (
                      <div className="absolute -top-2 -left-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-1.5 shadow-lg z-10">
                        <Crown className="h-3 w-3 text-white" fill="currentColor" />
                      </div>
                    )}
                    <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                      <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                      <AvatarFallback className="font-semibold bg-primary/10 text-primary text-lg">
                        {friend.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {activities.length > 0 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-destructive to-destructive/80 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                        {activities.length}
                      </div>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="font-semibold text-sm truncate">{friend.name}</p>
                    {activities.length === 0 ? (
                      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white text-xs mt-1">FREE</Badge>
                    ) : (
                      <div className="mt-1 space-y-1">
                        <p className="text-xs font-medium truncate w-full text-destructive" title={nextActivity.title}>
                          Next: {nextActivity.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(nextActivity.startDate).toLocaleDateString("en-MY", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        {remainingCount > 0 && (
                          <div className="flex items-center justify-center gap-1">
                            <div className="h-1 w-1 rounded-full bg-destructive/40" />
                            <span className="text-[10px] text-destructive/70 font-medium">{remainingCount} more</span>
                            <div className="h-1 w-1 rounded-full bg-destructive/40" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {overview.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{hasActiveFilters ? "No friends match your filters." : "No friends added yet."}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFriend} onOpenChange={() => setSelectedFriend(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="relative">
                {selectedFriend?.friend.isOwner && (
                  <div className="absolute -top-1 -left-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-1 shadow-lg z-10">
                    <Crown className="h-3 w-3 text-white" fill="currentColor" />
                  </div>
                )}
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={selectedFriend?.friend.imageUrl || "/placeholder.svg"}
                    alt={selectedFriend?.friend.name}
                  />
                  <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                    {selectedFriend?.friend.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg">{selectedFriend?.friend.name}'s Activities</p>
                  <div className="flex items-center gap-2">
                    {selectedFriend?.friend.quote && (
                      <p className="text-xs text-muted-foreground font-normal italic">
                        "{selectedFriend.friend.quote}"
                      </p>
                    )}
                    {selectedFriend?.friend.instagramHandle ? (
                      <a
                        href={`https://instagram.com/${selectedFriend.friend.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 transition-colors"
                        title={`@${selectedFriend.friend.instagramHandle}`}
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    ) : (
                      <div className="text-muted-foreground/30" title="No Instagram linked">
                        <Instagram className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-normal">
                  {selectedFriend?.activities.length} upcoming{" "}
                  {selectedFriend?.activities.length === 1 ? "trip" : "trips"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedFriend?.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                allFriends={data.friends}
                onRequestJoin={handleRequestJoin}
                currentFriend={selectedFriend.friend} // Pass the current friend being viewed
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <JoinRequestModal
        activity={selectedActivity}
        friends={data.friends}
        open={showJoinRequestModal}
        onOpenChange={setShowJoinRequestModal}
        onSuccess={() => {
          setShowJoinRequestModal(false)
          setSelectedActivity(null)
        }}
      />
    </>
  )
}

function ActivityCard({
  activity,
  allFriends,
  onRequestJoin,
  currentFriend, // Added currentFriend prop to filter out from participants
}: {
  activity: Activity
  allFriends: Friend[]
  onRequestJoin: (activity: Activity) => void
  currentFriend?: Friend // Optional current friend being viewed
}) {
  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "trip":
        return "bg-blue-500/10 text-blue-700 border-blue-200"
      case "activity":
        return "bg-purple-500/10 text-purple-700 border-purple-200"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200"
    }
  }

  const participatingFriends = allFriends.filter(
    (friend) =>
      (activity.friendIds?.includes(friend.id) || friend.id === activity.friendId) && friend.id !== currentFriend?.id,
  )

  return (
    <div className="bg-card rounded-lg p-3 space-y-2 border shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold flex-1">{activity.title}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRequestJoin(activity)
          }}
          className="shrink-0"
        >
          Join
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline" className="font-mono">
          {new Date(activity.startDate).toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
          })}{" "}
          -{" "}
          {new Date(activity.endDate).toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Badge>
        <Badge className={cn("border", getActivityColor(activity.type))}>{activity.type}</Badge>
      </div>
      {activity.type === "activity" && activity.startTime && activity.endTime && (
        <p className="text-xs text-muted-foreground">
          🕐 {activity.startTime} - {activity.endTime}
        </p>
      )}
      {activity.location && <p className="text-xs text-muted-foreground">📍 {activity.location}</p>}
      {activity.budget && <p className="text-xs text-muted-foreground">💰 RM {activity.budget.toFixed(2)}</p>}
      {participatingFriends.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">With:</span>
          <div className="flex -space-x-2">
            {participatingFriends.map((friend) => (
              <Avatar key={friend.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {friend.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{participatingFriends.map((f) => f.name).join(", ")}</span>
        </div>
      )}
      {activity.notes && <p className="text-sm text-muted-foreground italic">{activity.notes}</p>}
    </div>
  )
}
