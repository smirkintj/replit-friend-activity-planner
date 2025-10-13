"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Send, CheckCircle, CalendarIcon, Clock } from "lucide-react"
import { submitFriendRequest, getStoredData } from "@/lib/storage"
import type { Friend } from "@/lib/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function FriendRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [showTimeFields, setShowTimeFields] = useState(false)
  const [formData, setFormData] = useState({
    friendId: "",
    activityTitle: "",
    startDate: "",
    endDate: "",
    activityType: "trip" as "trip" | "activity",
    withWho: "",
    notes: "",
    startTime: "",
    endTime: "",
  })
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  useEffect(() => {
    const loadFriends = async () => {
      const data = await getStoredData()
      setFriends(data.friends)
      setLoading(false)
    }
    loadFriends()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.friendId || !formData.activityTitle.trim() || !formData.startDate || !formData.endDate) {
      return
    }

    const selectedFriend = friends.find((f) => f.id === formData.friendId)
    if (!selectedFriend) return

    await submitFriendRequest({
      friendName: selectedFriend.name,
      activityTitle: formData.activityTitle,
      startDate: formData.startDate,
      endDate: formData.endDate,
      activityType: formData.activityType,
      withWho: formData.withWho || undefined,
      notes: formData.notes || undefined,
    })

    setSubmitted(true)
    setFormData({
      friendId: "",
      activityTitle: "",
      startDate: "",
      endDate: "",
      activityType: "trip",
      withWho: "",
      notes: "",
      startTime: "",
      endTime: "",
    })
    setShowTimeFields(false)

    setTimeout(() => setSubmitted(false), 3000)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Plans</CardTitle>
        <CardDescription>bagitau please korang punya plan ape</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
            <p className="font-medium">Request submitted!</p>
            <p className="text-sm text-muted-foreground mt-1">The admin will review and add it to the calendar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="friendId">Your Name</Label>
              <Select
                value={formData.friendId}
                onValueChange={(value) => setFormData({ ...formData, friendId: value })}
              >
                <SelectTrigger id="friendId">
                  <SelectValue placeholder="Select your name" />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      {friend.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityTitle">Activity/Trip</Label>
              <Input
                id="activityTitle"
                placeholder="e.g., Trip to Bali, Work Conference"
                value={formData.activityTitle}
                onChange={(e) => setFormData({ ...formData, activityTitle: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityType">Type</Label>
              <Select
                value={formData.activityType}
                onValueChange={(value: "trip" | "activity") => setFormData({ ...formData, activityType: value })}
              >
                <SelectTrigger id="activityType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trip">Trip</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
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
                <Label>End Date</Label>
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
            {formData.activityType === "activity" && (
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
              <Label htmlFor="notes">Notes/Remarks (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
