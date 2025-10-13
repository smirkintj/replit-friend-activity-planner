"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { Activity, Friend } from "@/lib/types"
import { submitJoinRequest, checkActivityOverlap } from "@/lib/storage"

interface JoinRequestModalProps {
  activity: Activity | null
  friends: Friend[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function JoinRequestModal({ activity, friends, open, onOpenChange, onSuccess }: JoinRequestModalProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string>("")
  const [probability, setProbability] = useState<"confirmed" | "maybe" | "unlikely">("confirmed")
  const [overlappingActivities, setOverlappingActivities] = useState<Activity[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAlreadyParticipant = (friendId: string): boolean => {
    if (!activity) return false
    return activity.friendId === friendId || activity.friendIds?.includes(friendId) || false
  }

  useEffect(() => {
    if (selectedFriendId && activity) {
      checkOverlap()
    } else {
      setOverlappingActivities([])
    }
  }, [selectedFriendId, activity])

  const checkOverlap = async () => {
    if (!selectedFriendId || !activity) return

    setIsChecking(true)
    try {
      const overlaps = await checkActivityOverlap(selectedFriendId, activity.startDate, activity.endDate)
      setOverlappingActivities(overlaps)
    } catch (error) {
      console.error("[v0] Error checking overlap:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFriendId || !activity) return

    if (isAlreadyParticipant(selectedFriendId)) {
      alert("You are already a participant in this activity!")
      return
    }

    setIsSubmitting(true)
    try {
      await submitJoinRequest(activity.id, selectedFriendId, probability)
      onSuccess()
      onOpenChange(false)
      setSelectedFriendId("")
      setProbability("confirmed")
      setOverlappingActivities([])
    } catch (error) {
      console.error("[v0] Error submitting join request:", error)
      alert("Failed to submit join request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request to Join: {activity.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Who are you?</Label>
            <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
              <SelectTrigger>
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {friends.map((friend) => {
                  const alreadyIn = isAlreadyParticipant(friend.id)
                  return (
                    <SelectItem key={friend.id} value={friend.id} disabled={alreadyIn}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                          <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {friend.name}
                        {alreadyIn && <span className="text-xs text-muted-foreground">(Already joined)</span>}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Probability of Joining</Label>
            <Select value={probability} onValueChange={(v: any) => setProbability(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                <SelectItem value="maybe">🤔 Maybe</SelectItem>
                <SelectItem value="unlikely">❓ Unlikely</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isChecking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking for overlapping activities...
            </div>
          )}

          {overlappingActivities.length > 0 && !isChecking && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">You have overlapping activities:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {overlappingActivities.map((overlap) => (
                    <li key={overlap.id}>
                      {overlap.title} ({new Date(overlap.startDate).toLocaleDateString()} -{" "}
                      {new Date(overlap.endDate).toLocaleDateString()})
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">You can still proceed with your request.</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFriendId || isSubmitting || isAlreadyParticipant(selectedFriendId)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
