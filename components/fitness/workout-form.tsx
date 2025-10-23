"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FitnessActivity, Friend } from "@/lib/types"
import { calculateActivityPoints, getActivityIcon, getActivityColor } from "@/lib/fitness-points"
import { estimateCalories } from "@/lib/calorie-estimator"
import { Dumbbell, X, Zap, CalendarIcon } from "lucide-react"
import { format, startOfDay, formatISO } from "date-fns"
import { cn } from "@/lib/utils"

interface WorkoutFormProps {
  friends: Friend[]
  onSubmit: (activity: Omit<FitnessActivity, "id" | "createdAt" | "points">) => Promise<void>
  onClose: () => void
  currentFriendId?: string
}

export function WorkoutForm({ friends, onSubmit, onClose, currentFriendId }: WorkoutFormProps) {
  const [friendId, setFriendId] = useState(currentFriendId || "")
  const [type, setType] = useState<FitnessActivity["type"]>("run")
  const [date, setDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState("")
  const [distance, setDistance] = useState("")
  const [calories, setCalories] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsDistance = ["run", "bike", "swim", "walk", "hike"].includes(type)
  const estimatedPoints = calculateActivityPoints(type, parseInt(duration) || 0, parseFloat(distance) || undefined)
  
  // Auto-calculate calories when distance or duration changes
  useEffect(() => {
    const durationNum = parseInt(duration) || 0
    const distanceNum = parseFloat(distance) || 0
    
    if (durationNum > 0) {
      const estimated = estimateCalories(type, distanceNum, durationNum)
      setCalories(estimated.toString())
    }
  }, [type, duration, distance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendId || !duration) return

    setIsSubmitting(true)
    try {
      // Use start of day to avoid timezone issues
      const dateAtStartOfDay = startOfDay(date)
      
      await onSubmit({
        friendId,
        type,
        date: formatISO(dateAtStartOfDay),
        duration: parseInt(duration),
        distance: distance ? parseFloat(distance) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        source: "manual",
        notes: notes || undefined
      })
      
      // Reset form
      setType("run")
      setDate(new Date())
      setDuration("")
      setDistance("")
      setCalories("")
      setNotes("")
      onClose()
    } catch (error) {
      console.error("Error submitting workout:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="gradient-text">Log Workout</CardTitle>
              <CardDescription>Track your fitness activity</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Who worked out?</Label>
            <Select value={friendId} onValueChange={setFriendId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select friend" />
              </SelectTrigger>
              <SelectContent>
                {friends.map(friend => (
                  <SelectItem key={friend.id} value={friend.id}>
                    {friend.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as FitnessActivity["type"])} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="run">{getActivityIcon("run")} Running</SelectItem>
                <SelectItem value="bike">{getActivityIcon("bike")} Cycling</SelectItem>
                <SelectItem value="swim">{getActivityIcon("swim")} Swimming</SelectItem>
                <SelectItem value="walk">{getActivityIcon("walk")} Walking</SelectItem>
                <SelectItem value="hike">{getActivityIcon("hike")} Hiking</SelectItem>
                <SelectItem value="gym">{getActivityIcon("gym")} Gym</SelectItem>
                <SelectItem value="yoga">{getActivityIcon("yoga")} Yoga</SelectItem>
                <SelectItem value="other">{getActivityIcon("other")} Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Workout Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  disabled={(checkDate) => {
                    if (!checkDate) return false
                    const today = startOfDay(new Date())
                    const minDate = startOfDay(new Date("2024-01-01"))
                    const dateToCheck = startOfDay(checkDate)
                    return dateToCheck > today || dateToCheck < minDate
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                required
                min="1"
              />
            </div>
            {needsDistance && (
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5.0"
                  min="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-yellow-400" />
              Calories (auto-calculated)
            </Label>
            <Input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Estimated based on activity type, distance, and duration. You can adjust if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?"
              rows={2}
            />
          </div>

          {duration && (
            <div className={`p-4 rounded-lg bg-gradient-to-r ${getActivityColor(type)} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Estimated Points</p>
                  <p className="text-3xl font-bold">{estimatedPoints}</p>
                </div>
                <div className="text-5xl">{getActivityIcon(type)}</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting || !friendId || !duration}>
              {isSubmitting ? "Logging..." : "Log Workout"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
