"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Users,
  Crown,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  Sparkles,
  Send,
} from "lucide-react"
import type { Activity, Friend, ActivityComment, ActivityReaction } from "@/lib/types"
import { format, isPast } from "date-fns"
import { JoinRequestModal } from "@/components/join-request-modal"
import {
  getActivityComments,
  getActivityReactions,
  addActivityComment,
  addActivityReaction,
  removeActivityReaction,
} from "@/lib/storage"

interface TripDetailModalProps {
  activity: Activity | null
  friends: Friend[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const activityTypeColors = {
  trip: "bg-blue-500 text-white",
  activity: "bg-purple-500 text-white",
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  laugh: Laugh,
  wow: Sparkles,
  sad: Frown,
}

const reactionColors = {
  like: "text-blue-500",
  love: "text-red-500",
  laugh: "text-yellow-500",
  wow: "text-purple-500",
  sad: "text-gray-500",
}

export function TripDetailModal({ activity, friends, open, onOpenChange }: TripDetailModalProps) {
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false)
  const [comments, setComments] = useState<ActivityComment[]>([])
  const [reactions, setReactions] = useState<ActivityReaction[]>([])
  const [newComment, setNewComment] = useState("")
  const [selectedFriendId, setSelectedFriendId] = useState<string>("")
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isActivityPast = activity ? isPast(new Date(activity.endDate)) : false

  useEffect(() => {
    if (activity && open) {
      loadCommentsAndReactions()
    }
  }, [activity, open])

  const loadCommentsAndReactions = async () => {
    if (!activity) return

    const [commentsData, reactionsData] = await Promise.all([
      getActivityComments(activity.id),
      getActivityReactions(activity.id),
    ])

    const sortedComments = commentsData.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    setComments(sortedComments)
    setReactions(reactionsData)
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setNewComment(value)
    setCursorPosition(cursorPos)

    // Check if user is typing @mention
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1].toLowerCase())
      setShowMentionDropdown(true)

      // Calculate dropdown position
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect()
        setMentionPosition({
          top: rect.top - 150,
          left: rect.left,
        })
      }
    } else {
      setShowMentionDropdown(false)
    }
  }

  const filteredFriendsForMention = friends.filter((friend) => friend.name.toLowerCase().includes(mentionSearch))

  const insertMention = (friendName: string) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition)
    const textAfterCursor = newComment.slice(cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index)
      const newText = `${beforeMention}@${friendName} ${textAfterCursor}`
      setNewComment(newText)
      setShowMentionDropdown(false)

      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeMention.length + friendName.length + 2
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const handleAddComment = async () => {
    if (!activity || !newComment.trim() || !selectedFriendId) return

    try {
      // Parse @mentions from comment
      const mentionRegex = /@(\w+)/g
      const mentions = [...newComment.matchAll(mentionRegex)]
      const taggedFriendIds = mentions
        .map((match) => {
          const name = match[1]
          return friends.find((f) => f.name.toLowerCase() === name.toLowerCase())?.id
        })
        .filter((id): id is string => id !== undefined)

      await addActivityComment(activity.id, selectedFriendId, newComment, taggedFriendIds)
      setNewComment("")
      await loadCommentsAndReactions()
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    }
  }

  const handleReaction = async (reactionType: "like" | "love" | "laugh" | "wow" | "sad") => {
    if (!activity || !selectedFriendId) return

    try {
      // Check if user already reacted with this type
      const existingReaction = reactions.find((r) => r.friendId === selectedFriendId && r.reactionType === reactionType)

      if (existingReaction) {
        await removeActivityReaction(activity.id, selectedFriendId, reactionType)
      } else {
        await addActivityReaction(activity.id, selectedFriendId, reactionType)
      }

      await loadCommentsAndReactions()
    } catch (error) {
      console.error("[v0] Error handling reaction:", error)
      alert("Failed to add reaction. Please try again.")
    }
  }

  if (!activity) return null

  const participatingFriends = activity.friendIds
    ? activity.friendIds.map((id) => friends.find((f) => f.id === id)).filter((f): f is Friend => f !== undefined)
    : [friends.find((f) => f.id === activity.friendId)].filter((f): f is Friend => f !== undefined)

  // Group reactions by type
  const reactionCounts = reactions.reduce(
    (acc, r) => {
      acc[r.reactionType] = (acc[r.reactionType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const renderCommentWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="text-primary font-semibold bg-primary/10 px-1 rounded">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Badge className={activityTypeColors[activity.type]}>{activity.type}</Badge>
              <DialogTitle className="text-2xl">{activity.title}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Date Range */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-muted-foreground">Date</p>
                <p className="text-base">
                  {format(new Date(activity.startDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(activity.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Location (for activities) */}
            {activity.type === "activity" && activity.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Location</p>
                  <p className="text-base">{activity.location}</p>
                </div>
              </div>
            )}

            {/* Time (for activities) */}
            {activity.type === "activity" && activity.startTime && activity.endTime && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Time</p>
                  <p className="text-base">
                    {activity.startTime} - {activity.endTime}
                  </p>
                </div>
              </div>
            )}

            {/* Budget */}
            {activity.budget && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">Budget</p>
                  <p className="text-base">RM {activity.budget.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-muted-foreground mb-2">Participants</p>
                <div className="flex flex-wrap gap-3">
                  {participatingFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2">
                          <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                          <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {friend.isOwner && (
                          <div className="absolute -top-1 -left-1 bg-yellow-400 rounded-full p-0.5">
                            <Crown className="h-3 w-3 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{friend.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* With Who */}
            {activity.withWho && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">With</p>
                  <p className="text-base">{activity.withWho}</p>
                </div>
              </div>
            )}

            {/* Itinerary */}
            {activity.itinerary && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-muted-foreground mb-2">Itinerary</p>
                  <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">{activity.itinerary}</div>
                </div>
              </div>
            )}

            {/* Notes */}
            {activity.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-muted-foreground mb-2">Notes</p>
                  <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">{activity.notes}</div>
                </div>
              </div>
            )}

            {isActivityPast ? (
              <div className="pt-4 border-t space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-3">Reactions</h3>

                  <div className="flex gap-2 mb-3">
                    {(Object.keys(reactionIcons) as Array<keyof typeof reactionIcons>).map((type) => {
                      const Icon = reactionIcons[type]
                      const hasReacted = reactions.some(
                        (r) => r.friendId === selectedFriendId && r.reactionType === type,
                      )
                      const count = reactionCounts[type] || 0
                      return (
                        <button
                          key={type}
                          onClick={() => handleReaction(type)}
                          disabled={!selectedFriendId}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                            hasReacted
                              ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                              : "bg-background border-border hover:bg-muted"
                          } ${!selectedFriendId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <Icon className={`h-4 w-4 ${hasReacted ? "text-primary" : reactionColors[type]}`} />
                          {count > 0 && <span className="text-sm font-medium">{count}</span>}
                        </button>
                      )
                    })}
                  </div>

                  {!selectedFriendId && (
                    <p className="text-xs text-muted-foreground">Select your name below to react</p>
                  )}
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Comments</h3>

                  <div className="mb-3">
                    <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your name to comment" />
                      </SelectTrigger>
                      <SelectContent>
                        {friends.map((friend) => (
                          <SelectItem key={friend.id} value={friend.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                                <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {friend.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <div className="flex gap-2 mb-4">
                      <Textarea
                        ref={textareaRef}
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Add a comment... (type @ to tag friends)"
                        className="flex-1 min-h-[80px]"
                        disabled={!selectedFriendId}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim() || !selectedFriendId} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {showMentionDropdown && filteredFriendsForMention.length > 0 && (
                      <div
                        className="absolute z-50 w-64 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                        style={{
                          bottom: "100%",
                          left: 0,
                          marginBottom: "4px",
                        }}
                      >
                        {filteredFriendsForMention.map((friend) => (
                          <button
                            key={friend.id}
                            onClick={() => insertMention(friend.name)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={friend.imageUrl || "/placeholder.svg"} />
                              <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{friend.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.friendImageUrl || "/placeholder.svg"} />
                            <AvatarFallback>{comment.friendName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{comment.friendName}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            {/* Render comment with highlighted @mentions */}
                            <p className="text-sm whitespace-pre-wrap">{renderCommentWithMentions(comment.comment)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <Button onClick={() => setShowJoinRequestModal(true)} className="w-full" size="lg">
                  Request to Join
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Join request modal - only show for future activities */}
      {!isActivityPast && (
        <JoinRequestModal
          activity={activity}
          friends={friends}
          open={showJoinRequestModal}
          onOpenChange={setShowJoinRequestModal}
          onSuccess={() => {
            setShowJoinRequestModal(false)
          }}
        />
      )}
    </>
  )
}
