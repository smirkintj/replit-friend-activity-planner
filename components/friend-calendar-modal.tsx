"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock } from "lucide-react"
import { saveActivity, deleteActivity } from "@/lib/storage"
import type { Friend, Activity, BudgetItem } from "@/lib/types"
import { format, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { BudgetBreakdown } from "@/components/budget-breakdown"

interface FriendCalendarModalProps {
  friend: Friend
  activities: Activity[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function FriendCalendarModal({ friend, activities, open, onOpenChange, onUpdate }: FriendCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showTimeFields, setShowTimeFields] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "trip" as "trip" | "activity",
    withWho: "",
    notes: "",
    location: "",
    startTime: "",
    endTime: "",
    budgetBreakdown: [] as BudgetItem[],
    itinerary: "",
  })

  const friendActivities = activities.filter((a) => a.friendId === friend.id || a.friendIds?.includes(friend.id))

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    // Get first day of the month at local midnight
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // Generate 42 days (6 weeks) for consistent grid
    const days: Date[] = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      // Normalize to local midnight
      const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      days.push(normalizedDay)
    }

    return days
  }

  const daysInMonth = generateCalendarDays(currentMonth)

  const getActivityForDate = (date: Date) => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    return friendActivities.find((activity) => {
      const startStr = activity.startDate
      const endStr = activity.endDate
      const start = new Date(startStr)
      const end = new Date(endStr)

      // Create dates at local midnight
      const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate())

      return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd
    })
  }

  const handleDateClick = (date: Date) => {
    if (isSelecting) {
      const exists = selectedDates.some((d) => isSameDay(d, date))
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => !isSameDay(d, date)))
      } else {
        setSelectedDates([...selectedDates, date].sort((a, b) => a.getTime() - b.getTime()))
      }
    }
  }

  const handleStartSelection = () => {
    setIsSelecting(true)
    setSelectedDates([])
  }

  const handleCancelSelection = () => {
    setIsSelecting(false)
    setSelectedDates([])
    setShowForm(false)
    setShowTimeFields(false)
  }

  const handleContinue = () => {
    if (selectedDates.length > 0) {
      setShowForm(true)
      setIsSelecting(false)
    }
  }

  const handleSave = async () => {
    if (selectedDates.length === 0 || !formData.title.trim()) return

    if (formData.type === "activity" && !formData.location) {
      alert("Location is required for activities")
      return
    }

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
    const startDate = format(sortedDates[0], "yyyy-MM-dd")
    const endDate = format(sortedDates[sortedDates.length - 1], "yyyy-MM-dd")

    const totalBudget = formData.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)

    await saveActivity({
      friendId: friend.id,
      friendIds: [friend.id],
      title: formData.title,
      startDate,
      endDate,
      type: formData.type,
      withWho: formData.withWho || undefined,
      notes: formData.notes || undefined,
      location: formData.location || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      budget: totalBudget > 0 ? totalBudget : undefined,
      budgetBreakdown: formData.budgetBreakdown.length > 0 ? formData.budgetBreakdown : undefined,
      itinerary: formData.itinerary || undefined,
    })

    setSelectedDates([])
    setShowForm(false)
    setShowTimeFields(false)
    setFormData({
      title: "",
      type: "trip",
      withWho: "",
      notes: "",
      location: "",
      startTime: "",
      endTime: "",
      budgetBreakdown: [],
      itinerary: "",
    })
    onUpdate()
  }

  const handleDeleteActivity = async (activityId: string) => {
    await deleteActivity(activityId)
    onUpdate()
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "trip":
        return "bg-blue-500"
      case "activity":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{friend.name}'s Calendar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((date) => {
                const activity = getActivityForDate(date)
                const isSelected = selectedDates.some((d) => isSameDay(d, date))
                const isCurrentMonthDay = isSameMonth(date, currentMonth)

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    disabled={!isSelecting}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium transition-all
                      ${!isCurrentMonthDay ? "text-muted-foreground opacity-30 bg-muted/20" : ""}
                      ${isSelected ? "ring-2 ring-primary bg-primary/10" : ""}
                      ${activity ? `${getActivityColor(activity.type)} text-white` : "hover:bg-muted"}
                      ${isSelecting && !activity ? "cursor-pointer" : ""}
                      ${!isSelecting && activity ? "cursor-default" : ""}
                    `}
                  >
                    <div>{format(date, "d")}</div>
                    {activity && <div className="text-[10px] truncate mt-1">{activity.title}</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          {!isSelecting && !showForm && (
            <Button onClick={handleStartSelection} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          )}

          {isSelecting && (
            <div className="flex gap-2">
              <Button onClick={handleContinue} disabled={selectedDates.length === 0} className="flex-1">
                Continue ({selectedDates.length} days selected)
              </Button>
              <Button variant="outline" onClick={handleCancelSelection}>
                Cancel
              </Button>
            </div>
          )}

          {/* Activity Form */}
          {showForm && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Activity Title</Label>
                <Input
                  placeholder="e.g., Trip to Bali"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trip">Trip</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "activity" && (
                <>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input
                      placeholder="e.g., Conference Center, Restaurant"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  {!showTimeFields ? (
                    <Button type="button" variant="outline" onClick={() => setShowTimeFields(true)} className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Add Start & End Time
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowTimeFields(false)
                          setFormData({ ...formData, startTime: "", endTime: "" })
                        }}
                        className="w-full"
                      >
                        Remove Time
                      </Button>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label>Budget (RM) (Optional)</Label>
                <BudgetBreakdown
                  breakdown={formData.budgetBreakdown}
                  onChange={(breakdown) => setFormData({ ...formData, budgetBreakdown: breakdown })}
                />
              </div>

              <div className="space-y-2">
                <Label>Itinerary (Optional)</Label>
                <Textarea
                  placeholder="Day 1: Arrival&#10;Day 2: Beach&#10;Day 3: Departure"
                  value={formData.itinerary}
                  onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>With Who (Optional)</Label>
                <Input
                  placeholder="e.g., Family, Friends"
                  value={formData.withWho}
                  onChange={(e) => setFormData({ ...formData, withWho: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any additional details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!formData.title.trim()} className="flex-1">
                  Save Activity
                </Button>
                <Button variant="outline" onClick={handleCancelSelection}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Activities List */}
          {friendActivities.length > 0 && !showForm && (
            <div className="space-y-2">
              <h4 className="font-semibold">Existing Activities</h4>
              <div className="space-y-2">
                {friendActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getActivityColor(activity.type)}>{activity.type}</Badge>
                        <span className="font-medium">{activity.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(activity.startDate), "MMM d")} -{" "}
                        {format(new Date(activity.endDate), "MMM d, yyyy")}
                      </p>
                      {activity.type === "activity" && activity.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {activity.location}
                          {activity.startTime && activity.endTime && (
                            <span className="ml-2">
                              🕐 {activity.startTime} - {activity.endTime}
                            </span>
                          )}
                        </p>
                      )}
                      {activity.withWho && <p className="text-sm text-muted-foreground">With: {activity.withWho}</p>}
                      {activity.notes && <p className="text-sm text-muted-foreground">{activity.notes}</p>}
                      {activity.budget && (
                        <p className="text-sm text-muted-foreground">💰 Budget: RM {activity.budget.toFixed(2)}</p>
                      )}
                      {activity.itinerary && (
                        <p className="text-sm text-muted-foreground">Itinerary: {activity.itinerary}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteActivity(activity.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
