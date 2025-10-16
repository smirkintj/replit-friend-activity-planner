"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Check, Clock, Repeat, CalendarIcon } from "lucide-react"
import { saveActivity, deleteActivity, logActivity } from "@/lib/storage"
import type { AppData, Activity, BudgetItem } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { BudgetBreakdown } from "@/components/budget-breakdown"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivitiesManagerProps {
  data: AppData
  onUpdate: () => void
  editingActivity?: Activity | null
}

export function ActivitiesManager({ data, onUpdate, editingActivity }: ActivitiesManagerProps) {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showTimeFields, setShowTimeFields] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [formData, setFormData] = useState({
    friendIds: [] as string[],
    organizerId: "" as string,
    title: "",
    startDate: "",
    endDate: "",
    type: "trip" as Activity["type"],
    withWho: "",
    notes: "",
    linkedActivityId: "",
    location: "",
    startTime: "",
    endTime: "",
    budgetBreakdown: [] as BudgetItem[],
    isRecurring: false,
    recurrencePattern: "weekly" as "daily" | "weekly" | "monthly",
    recurrenceEndDate: "",
  })

  useEffect(() => {
    if (editingActivity) {
      setEditingId(editingActivity.id)
      setShowTimeFields(!!(editingActivity.startTime && editingActivity.endTime))
      setFormData({
        friendIds: editingActivity.friendIds || [editingActivity.friendId],
        organizerId: editingActivity.organizerId || editingActivity.friendIds?.[0] || editingActivity.friendId,
        title: editingActivity.title,
        startDate: editingActivity.startDate,
        endDate: editingActivity.endDate,
        type: editingActivity.type,
        withWho: editingActivity.withWho || "",
        notes: editingActivity.notes || "",
        linkedActivityId: editingActivity.linkedActivityId || "",
        location: editingActivity.location || "",
        startTime: editingActivity.startTime || "",
        endTime: editingActivity.endTime || "",
        budgetBreakdown: editingActivity.budgetBreakdown || [],
        isRecurring: editingActivity.isRecurring || false,
        recurrencePattern: editingActivity.recurrencePattern || "weekly",
        recurrenceEndDate: editingActivity.recurrenceEndDate || "",
      })
    }
  }, [editingActivity])

  const handleAdd = async () => {
    if (formData.friendIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one friend for this activity.",
        variant: "destructive",
      })
      return
    }

    if (!formData.organizerId) {
      toast({
        title: "Validation Error",
        description: "Please select an organizer for this activity.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an activity title.",
        variant: "destructive",
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates.",
        variant: "destructive",
      })
      return
    }

    const totalBudget = formData.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)

    const activityData = {
      friendId: formData.friendIds[0],
      friendIds: formData.friendIds,
      organizerId: formData.organizerId,
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
      withWho: formData.withWho || undefined,
      notes: formData.notes || undefined,
      linkedActivityId: formData.linkedActivityId || undefined,
      location: formData.location || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      budget: totalBudget > 0 ? totalBudget : undefined,
      budgetBreakdown: formData.budgetBreakdown.length > 0 ? formData.budgetBreakdown : undefined,
      isRecurring: formData.isRecurring || undefined,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
      recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : undefined,
    }

    const activityId = await saveActivity(activityData)
    console.log("[v0] Activity created with ID:", activityId)

    const organizer = data.friends.find((f) => f.id === formData.organizerId)
    const participantNames = formData.friendIds
      .map((id) => data.friends.find((f) => f.id === id)?.name)
      .filter(Boolean)
      .join(", ")

    console.log("[v0] About to log activity creation with:", {
      activityId,
      title: formData.title,
      type: formData.type,
      participantNames,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      organizerName: organizer?.name,
    })

    await logActivity(
      "trip_created",
      activityId,
      formData.title,
      formData.type,
      participantNames,
      formData.location,
      formData.startDate,
      formData.endDate,
      organizer?.name,
    )
    console.log("[v0] Activity log created for:", formData.title)

    // Send email notifications to participants
    const { sendTripNotifications } = await import("@/lib/email-helpers")
    await sendTripNotifications('created', { ...activityData, id: activityId }, data.friends)

    setFormData({
      friendIds: [],
      organizerId: "",
      title: "",
      startDate: "",
      endDate: "",
      type: "trip",
      withWho: "",
      notes: "",
      linkedActivityId: "",
      location: "",
      startTime: "",
      endTime: "",
      budgetBreakdown: [],
      isRecurring: false,
      recurrencePattern: "weekly",
      recurrenceEndDate: "",
    })
    setIsAdding(false)
    setShowTimeFields(false)
    onUpdate()
  }

  const [originalDates, setOriginalDates] = useState<{ startDate: string; endDate: string } | null>(null)

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setShowTimeFields(!!(activity.startTime && activity.endTime))
    // Store original dates for comparison
    setOriginalDates({
      startDate: activity.startDate,
      endDate: activity.endDate,
    })
    setFormData({
      friendIds: activity.friendIds || [activity.friendId],
      organizerId: activity.organizerId || activity.friendIds?.[0] || activity.friendId,
      title: activity.title,
      startDate: activity.startDate,
      endDate: activity.endDate,
      type: activity.type,
      withWho: activity.withWho || "",
      notes: activity.notes || "",
      linkedActivityId: activity.linkedActivityId || "",
      location: activity.location || "",
      startTime: activity.startTime || "",
      endTime: activity.endTime || "",
      budgetBreakdown: activity.budgetBreakdown || [],
      isRecurring: activity.isRecurring || false,
      recurrencePattern: activity.recurrencePattern || "weekly",
      recurrenceEndDate: activity.recurrenceEndDate || "",
    })
  }

  const handleUpdate = async () => {
    if (formData.friendIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one friend for this activity.",
        variant: "destructive",
      })
      return
    }

    if (!formData.organizerId) {
      toast({
        title: "Validation Error",
        description: "Please select an organizer for this activity.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an activity title.",
        variant: "destructive",
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates.",
        variant: "destructive",
      })
      return
    }

    if (!editingId) {
      toast({
        title: "Error",
        description: "No activity selected for editing.",
        variant: "destructive",
      })
      return
    }

    const totalBudget = formData.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)

    await saveActivity({
      id: editingId,
      friendId: formData.friendIds[0],
      friendIds: formData.friendIds,
      organizerId: formData.organizerId,
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
      withWho: formData.withWho || undefined,
      notes: formData.notes || undefined,
      linkedActivityId: formData.linkedActivityId || undefined,
      location: formData.location || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      budget: totalBudget > 0 ? totalBudget : undefined,
      budgetBreakdown: formData.budgetBreakdown.length > 0 ? formData.budgetBreakdown : undefined,
      isRecurring: formData.isRecurring || undefined,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
      recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : undefined,
    })

    const organizer = data.friends.find((f) => f.id === formData.organizerId)
    const participantNames = formData.friendIds
      .map((id) => data.friends.find((f) => f.id === id)?.name)
      .filter(Boolean)
      .join(", ")

    await logActivity(
      "trip_updated",
      editingId,
      formData.title,
      formData.type,
      participantNames,
      formData.location,
      formData.startDate,
      formData.endDate,
      organizer?.name,
    )
    console.log("[v0] Activity update logged for:", formData.title)

    // Check if dates changed and send email notifications
    if (originalDates && (originalDates.startDate !== formData.startDate || originalDates.endDate !== formData.endDate)) {
      const { sendTripNotifications } = await import("@/lib/email-helpers")
      await sendTripNotifications('updated', {
        id: editingId,
        friendId: formData.friendIds[0],
        friendIds: formData.friendIds,
        organizerId: formData.organizerId,
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        withWho: formData.withWho,
        notes: formData.notes,
        location: formData.location,
      }, data.friends, {
        oldStartDate: originalDates.startDate,
        oldEndDate: originalDates.endDate,
      })
    }

    setFormData({
      friendIds: [],
      organizerId: "",
      title: "",
      startDate: "",
      endDate: "",
      type: "trip",
      withWho: "",
      notes: "",
      linkedActivityId: "",
      location: "",
      startTime: "",
      endTime: "",
      budgetBreakdown: [],
      isRecurring: false,
      recurrencePattern: "weekly",
      recurrenceEndDate: "",
    })
    setOriginalDates(null)
    setEditingId(null)
    setShowTimeFields(false)
    onUpdate()
  }

  const handleDelete = async (id: string) => {
    console.log("[v0] handleDelete called for activity ID:", id)

    const activity = data.activities.find((a) => a.id === id)

    if (activity) {
      const organizer = data.friends.find((f) => f.id === activity.organizerId)
      const participantNames = (activity.friendIds || [activity.friendId])
        .map((friendId) => data.friends.find((f) => f.id === friendId)?.name)
        .filter(Boolean)
        .join(", ")

      console.log("[v0] About to log activity deletion with:", {
        activityId: id,
        title: activity.title,
        type: activity.type,
        participantNames,
        location: activity.location,
        startDate: activity.startDate,
        endDate: activity.endDate,
        organizerName: organizer?.name,
      })

      try {
        await logActivity(
          "trip_deleted",
          id,
          activity.title,
          activity.type,
          participantNames,
          activity.location,
          activity.startDate,
          activity.endDate,
          organizer?.name,
        )
        console.log("[v0] Activity deletion logged successfully for:", activity.title)

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error("[v0] Failed to log activity deletion:", error)
      }

      // Send cancellation emails to participants BEFORE deletion
      try {
        const { sendTripNotifications } = await import("@/lib/email-helpers")
        await sendTripNotifications('cancelled', activity, data.friends)
      } catch (error) {
        console.error("[v0] Failed to send cancellation emails:", error)
        // Continue with deletion even if email fails
      }
    } else {
      console.error("[v0] Activity not found for deletion:", id)
    }

    await deleteActivity(id)
    console.log("[v0] Activity deleted from database:", id)
    onUpdate()
  }

  const toggleFriend = (friendId: string) => {
    setFormData((prev) => ({
      ...prev,
      friendIds: prev.friendIds.includes(friendId)
        ? prev.friendIds.filter((id) => id !== friendId)
        : [...prev.friendIds, friendId],
    }))
  }

  const getTypeColor = (type: Activity["type"]) => {
    switch (type) {
      case "trip":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "activity":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const availableActivities = data.activities.filter((a) => a.id !== editingId)

  return (
    <div className="space-y-6">
      {data.friends.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please add friends first before creating activities.</p>
          </CardContent>
        </Card>
      )}

      {data.friends.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Friends <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">Select at least one friend for this activity</p>
            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
              {data.friends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`friend-${friend.id}`}
                    checked={formData.friendIds.includes(friend.id)}
                    onCheckedChange={() => toggleFriend(friend.id)}
                  />
                  <label
                    htmlFor={`friend-${friend.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                      <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {friend.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.friendIds.length === 0 && (
              <p className="text-sm text-destructive">⚠️ At least one friend must be selected</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer" className="text-base font-semibold">
              Organizer <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">Who is organizing this {formData.type}?</p>
            <Select
              value={formData.organizerId}
              onValueChange={(value) => setFormData({ ...formData, organizerId: value })}
            >
              <SelectTrigger id="organizer">
                <SelectValue placeholder="Select organizer" />
              </SelectTrigger>
              <SelectContent>
                {formData.friendIds.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Please select friends first
                  </SelectItem>
                ) : (
                  formData.friendIds.map((friendId) => {
                    const friend = data.friends.find((f) => f.id === friendId)
                    return friend ? (
                      <SelectItem key={friend.id} value={friend.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                            <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {friend.name}
                        </div>
                      </SelectItem>
                    ) : null
                  })
                )}
              </SelectContent>
            </Select>
            {!formData.organizerId && formData.friendIds.length > 0 && (
              <p className="text-sm text-destructive">⚠️ Please select an organizer</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Activity Title</Label>
            <Input
              id="title"
              placeholder="e.g., Trip to Japan, Work Conference"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(new Date(formData.startDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, startDate: format(date, "yyyy-MM-dd") })
                        setStartDateOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(new Date(formData.endDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, endDate: format(date, "yyyy-MM-dd") })
                        setEndDateOpen(false)
                      }
                    }}
                    defaultMonth={formData.startDate ? new Date(formData.startDate) : undefined}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Activity["type"]) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
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
              {!showTimeFields ? (
                <Button type="button" variant="outline" onClick={() => setShowTimeFields(true)} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Add Start & End Time
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., KLCC, Pavilion KL"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedActivity">Link to Existing Activity (optional)</Label>
            <Select
              value={formData.linkedActivityId}
              onValueChange={(value) => setFormData({ ...formData, linkedActivityId: value })}
            >
              <SelectTrigger id="linkedActivity">
                <SelectValue placeholder="Select an activity to link (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableActivities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.title} ({new Date(activity.startDate).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link this activity to another one (e.g., same trip but different dates)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="withWho">With Who</Label>
            <Select value={formData.withWho} onValueChange={(value) => setFormData({ ...formData, withWho: value })}>
              <SelectTrigger id="withWho">
                <SelectValue placeholder="Select (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="colleagues">Colleagues</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes/Remarks</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <BudgetBreakdown
            breakdown={formData.budgetBreakdown}
            onChange={(breakdown) => setFormData({ ...formData, budgetBreakdown: breakdown })}
          />

          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked as boolean })}
              />
              <label
                htmlFor="isRecurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <Repeat className="h-4 w-4" />
                Recurring Activity
              </label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                  <Select
                    value={formData.recurrencePattern}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setFormData({ ...formData, recurrencePattern: value })
                    }
                  >
                    <SelectTrigger id="recurrencePattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate">Recurrence End Date</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">The activity will repeat until this date</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={formData.friendIds.length === 0 || !formData.organizerId}
            >
              <Check className="h-4 w-4 mr-2" />
              {editingId ? "Update" : "Add"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                setFormData({
                  friendIds: [],
                  organizerId: "",
                  title: "",
                  startDate: "",
                  endDate: "",
                  type: "trip",
                  withWho: "",
                  notes: "",
                  linkedActivityId: "",
                  location: "",
                  startTime: "",
                  endTime: "",
                  budgetBreakdown: [],
                  isRecurring: false,
                  recurrencePattern: "weekly",
                  recurrenceEndDate: "",
                })
                setShowTimeFields(false)
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
