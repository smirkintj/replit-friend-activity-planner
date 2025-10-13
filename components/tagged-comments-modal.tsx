"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Calendar } from "lucide-react"
import { getTaggedComments } from "@/lib/storage"
import type { Friend, ActivityComment } from "@/lib/types"
import { format } from "date-fns"

interface TaggedCommentsModalProps {
  friend: Friend
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaggedCommentsModal({ friend, open, onOpenChange }: TaggedCommentsModalProps) {
  const [comments, setComments] = useState<ActivityComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadComments()
      localStorage.setItem(`tagged-comments-viewed-${friend.id}`, new Date().toISOString())
    }
  }, [open, friend.id])

  const loadComments = async () => {
    setLoading(true)
    const data = await getTaggedComments(friend.id)
    setComments(data)
    setLoading(false)
  }

  // Helper function to highlight @mentions in comment text
  const renderCommentWithHighlights = (text: string) => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments Mentioning {friend.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments mentioning {friend.name} yet.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  {/* Activity context */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">From activity: {comment.activityTitle}</span>
                    {comment.activityStartDate && (
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(comment.activityStartDate), "MMM d, yyyy")}
                      </Badge>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.friendImageUrl || "/placeholder.svg"} alt={comment.friendName} />
                      <AvatarFallback>{comment.friendName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.friendName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{renderCommentWithHighlights(comment.comment)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
