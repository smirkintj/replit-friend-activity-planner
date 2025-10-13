"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, MapPin, Clock, X, DollarSign, Edit2, Trash2, ArrowUpDown } from "lucide-react"
import type { Activity, Friend } from "@/lib/types"
import { format, isAfter, isBefore, startOfDay } from "date-fns"
import { deleteActivity, logActivity } from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ActivitiesListViewProps {
  activities: Activity[]
  friends: Friend[]
  onEdit: (activity: Activity) => void
  onUpdate: () => void
}

export function ActivitiesListView({ activities, friends, onEdit, onUpdate }: ActivitiesListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "trip" | "activity">("all")
  const [friendFilter, setFriendFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past" | "custom">("upcoming")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"nearest" | "furthest">("nearest")

  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query) ||
          activity.notes?.toLowerCase().includes(query) ||
          activity.location?.toLowerCase().includes(query),
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.type === typeFilter)
    }

    // Friend filter
    if (friendFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.friendIds?.includes(friendFilter) || activity.friendId === friendFilter,
      )
    }

    // Date filter
    const today = startOfDay(new Date())
    if (dateFilter === "upcoming") {
      filtered = filtered.filter((activity) => isAfter(new Date(activity.endDate), today))
    } else if (dateFilter === "past") {
      filtered = filtered.filter((activity) => isBefore(new Date(activity.endDate), today))
    } else if (dateFilter === "custom" && customStartDate && customEndDate) {
      filtered = filtered.filter((activity) => {
        const activityStart = new Date(activity.startDate)
        const activityEnd = new Date(activity.endDate)
        const filterStart = new Date(customStartDate)
        const filterEnd = new Date(customEndDate)
        return (
          (activityStart >= filterStart && activityStart <= filterEnd) ||
          (activityEnd >= filterStart && activityEnd <= filterEnd) ||
          (activityStart <= filterStart && activityEnd >= filterEnd)
        )
      })
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return sortOrder === "nearest" ? dateA - dateB : dateB - dateA
    })
  }, [activities, searchQuery, typeFilter, friendFilter, dateFilter, customStartDate, customEndDate, sortOrder])

  const getActivityFriends = (activity: Activity) => {
    return friends.filter((f) => activity.friendIds?.includes(f.id) || f.id === activity.friendId)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "trip":
        return "bg-blue-500 text-white"
      case "activity":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const hasActiveFilters = searchQuery || typeFilter !== "all" || friendFilter !== "all" || dateFilter !== "upcoming"

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setFriendFilter("all")
    setDateFilter("upcoming")
    setCustomStartDate("")
    setCustomEndDate("")
  }

  const handleDelete = async (id: string) => {
    // Get activity details before deleting
    const activity = activities.find((a) => a.id === id)
    if (activity) {
      // Get participant names
      const activityFriends = getActivityFriends(activity)
      const participantNames = activityFriends.map((f) => f.name).join(", ")
      
      // Log the deletion with all details (Admin is the deleter)
      await logActivity(
        "trip_deleted",
        activity.id,
        activity.title,
        activity.type,
        participantNames,
        activity.location,
        activity.startDate,
        activity.endDate,
        "Admin"
      )
    }
    
    await deleteActivity(id)
    setDeleteActivityId(null)
    onUpdate()
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities, locations, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trip">Trip</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Friend</label>
              <Select value={friendFilter} onValueChange={setFriendFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Friends</SelectItem>
                  {friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      {friend.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By Date</label>
              <Select value={sortOrder} onValueChange={(value: "nearest" | "furthest") => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Nearest First
                    </div>
                  </SelectItem>
                  <SelectItem value="furthest">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Furthest First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredActivities.length} {filteredActivities.length === 1 ? "activity" : "activities"} found
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No activities found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => {
            const activityFriends = getActivityFriends(activity)
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardContent className="pt-6 flex-1 flex flex-col">
                  {/* Header with Type Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-base line-clamp-2 flex-1">{activity.title}</h3>
                    <Badge className={getTypeColor(activity.type)} variant="secondary">
                      {activity.type}
                    </Badge>
                  </div>

                  {/* Friend Avatars */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {activityFriends.slice(0, 3).map((friend) => (
                        <Avatar key={friend.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                          <AvatarFallback className="text-xs">{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ))}
                      {activityFriends.length > 3 && (
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                          +{activityFriends.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {activityFriends.map((f) => f.name).join(", ")}
                    </span>
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {format(new Date(activity.startDate), "MMM d")} -{" "}
                        {format(new Date(activity.endDate), "MMM d, yyyy")}
                      </span>
                    </div>

                    {activity.type === "activity" && activity.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    )}

                    {activity.type === "activity" && activity.startTime && activity.endTime && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          {activity.startTime} - {activity.endTime}
                        </span>
                      </div>
                    )}

                    {activity.budget && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>RM {activity.budget.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes Preview */}
                  {activity.notes && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 border-t pt-3">{activity.notes}</p>
                  )}

                  {/* Edit and Delete buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(activity)
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteActivityId(activity.id)
                      }}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteActivityId} onOpenChange={(open) => !open && setDeleteActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteActivityId && handleDelete(deleteActivityId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
