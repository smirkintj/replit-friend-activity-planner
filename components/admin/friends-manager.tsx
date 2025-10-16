"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit2, X, Check, Calendar, Crown, Search, MessageSquare } from "lucide-react"
import { saveFriend, deleteFriend, getTaggedComments, getLoggedInFriendId, logActivity, isSuperAdmin } from "@/lib/storage"
import type { AppData, Friend } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/image-upload"
import { FriendCalendarModal } from "@/components/friend-calendar-modal"
import { TaggedCommentsModal } from "@/components/tagged-comments-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FriendsManagerProps {
  data: AppData
  onUpdate: () => void
}

export function FriendsManager({ data, onUpdate }: FriendsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    imageUrl: "",
    groupIds: [] as string[],
    quote: "",
    instagramHandle: "",
    pin: "",
  })
  const [calendarFriend, setCalendarFriend] = useState<Friend | null>(null)
  const [taggedCommentsFriend, setTaggedCommentsFriend] = useState<Friend | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all")

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [loggedInFriendId, setLoggedInFriendId] = useState<string | null>(null)
  const [isSuper, setIsSuper] = useState(false)

  useEffect(() => {
    // Get logged in friend ID and check if superadmin
    setLoggedInFriendId(getLoggedInFriendId())
    setIsSuper(isSuperAdmin())
  }, [])

  useEffect(() => {
    loadUnreadCounts()
  }, [data.friends])

  const loadUnreadCounts = async () => {
    const counts: Record<string, number> = {}

    for (const friend of data.friends) {
      const lastViewed = localStorage.getItem(`tagged-comments-viewed-${friend.id}`)
      const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0

      const comments = await getTaggedComments(friend.id)
      const unreadCount = comments.filter((comment) => new Date(comment.createdAt).getTime() > lastViewedTime).length

      counts[friend.id] = unreadCount
    }

    setUnreadCounts(counts)
  }

  const handleOpenTaggedComments = (friend: Friend) => {
    setTaggedCommentsFriend(friend)
    localStorage.setItem(`tagged-comments-viewed-${friend.id}`, new Date().toISOString())
    setUnreadCounts((prev) => ({ ...prev, [friend.id]: 0 }))
  }

  const filteredFriends = data.friends.filter((friend) => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroupFilter === "all" || friend.groupIds.includes(selectedGroupFilter)
    return matchesSearch && matchesGroup
  })

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    const friendId = await saveFriend({
      name: formData.name,
      email: formData.email.trim() || undefined,
      imageUrl: formData.imageUrl || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(formData.name)}`,
      groupIds: formData.groupIds,
      isOwner: formData.name.toLowerCase() === "putra",
      quote: formData.quote.trim() || undefined,
      instagramHandle: formData.instagramHandle.trim() || undefined,
      pin: "2468",
    })

    await logActivity(
      "friend_created",
      friendId,
      formData.name,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      formData.name
    )

    setFormData({ name: "", email: "", imageUrl: "", groupIds: [], quote: "", instagramHandle: "", pin: "" })
    setIsAdding(false)
    onUpdate()
  }

  const handleEdit = (friend: Friend) => {
    setEditingId(friend.id)
    setFormData({
      name: friend.name,
      email: friend.email || "",
      imageUrl: friend.imageUrl,
      groupIds: friend.groupIds,
      quote: friend.quote || "",
      instagramHandle: friend.instagramHandle || "",
      pin: "", // PIN is not editable through this form for security
    })
  }

  const handleUpdate = async () => {
    if (!formData.name.trim() || !editingId) return

    // PIN is not updated through this form - it's managed separately for security
    await saveFriend({
      id: editingId,
      name: formData.name,
      email: formData.email.trim() || undefined,
      imageUrl: formData.imageUrl,
      groupIds: formData.groupIds,
      isOwner: formData.name.toLowerCase() === "putra",
      quote: formData.quote.trim() || undefined,
      instagramHandle: formData.instagramHandle.trim() || undefined,
    })

    await logActivity(
      "friend_updated",
      editingId,
      formData.name,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      formData.name
    )

    setFormData({ name: "", email: "", imageUrl: "", groupIds: [], quote: "", instagramHandle: "", pin: "" })
    setEditingId(null)
    onUpdate()
  }

  const toggleGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId],
    }))
  }

  const handleDelete = async (id: string) => {
    const friend = data.friends.find(f => f.id === id)
    
    await deleteFriend(id)
    
    if (friend) {
      await logActivity(
        "friend_deleted",
        friend.id,
        friend.name,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        friend.name
      )
    }
    
    onUpdate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Friends</h2>
          <p className="text-sm text-muted-foreground">Manage your friends and their groups</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        )}
      </div>

      {!isAdding && !editingId && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {data.groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Friend" : "Add New Friend"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Friend's name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (for trip notifications)</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Used to send trip notifications and calendar invites</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote">Personal Quote (max 35 characters)</Label>
              <Input
                id="quote"
                placeholder="e.g., perpetually in airplane mode"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value.slice(0, 35) })}
                maxLength={35}
              />
              <p className="text-xs text-muted-foreground">{formData.quote.length}/35 characters</p>
            </div>
            <ImageUpload
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
              fallbackText={formData.name.slice(0, 2).toUpperCase() || "?"}
            />
            {data.groups.length > 0 && (
              <div className="space-y-2">
                <Label>Groups</Label>
                <div className="space-y-2">
                  {data.groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={formData.groupIds.includes(group.id)}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                      <label
                        htmlFor={`group-${group.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle (optional)</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="instagram"
                    placeholder="username"
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value.replace("@", "") })}
                    className="pl-7"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Enter Instagram username without the @ symbol</p>
            </div>
            {editingId && (
              <div className="space-y-2">
                <Label htmlFor="pin">Personal PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="4-digit PIN"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">Update your personal PIN to login (4 digits)</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={editingId ? handleUpdate : handleAdd}>
                <Check className="h-4 w-4 mr-2" />
                {editingId ? "Update" : "Add"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setEditingId(null)
                  setFormData({ name: "", email: "", imageUrl: "", groupIds: [], quote: "", instagramHandle: "", pin: "" })
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFriends.map((friend) => (
          <Card key={friend.id}>
            <CardContent className="pt-6 relative">
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(friend)}
                  title={isSuper || friend.id === loggedInFriendId ? "Edit friend" : "Only admin or friend owner can edit"}
                  disabled={!isSuper && friend.id !== loggedInFriendId}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(friend.id)}
                  title={isSuper || friend.id === loggedInFriendId ? "Delete friend" : "Only admin or friend owner can delete"}
                  disabled={!isSuper && friend.id !== loggedInFriendId}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-4">
                <div className="relative">
                  {friend.isOwner && (
                    <div className="absolute -top-2 -left-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-1.5 shadow-lg z-10">
                      <Crown className="h-3 w-3 text-white" fill="currentColor" />
                    </div>
                  )}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                    <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{friend.name}</h3>
                  {friend.quote && <p className="text-xs text-muted-foreground italic mt-1">"{friend.quote}"</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {friend.groupIds.map((groupId) => {
                      const group = data.groups.find((g) => g.id === groupId)
                      return group ? (
                        <Badge key={groupId} variant="secondary" style={{ backgroundColor: group.color + "20" }}>
                          {group.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setCalendarFriend(friend)}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenTaggedComments(friend)}
                  className="relative"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Tagged
                  {unreadCounts[friend.id] > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {unreadCounts[friend.id]}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFriends.length === 0 && !isAdding && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || selectedGroupFilter !== "all"
                ? "No friends match your filters."
                : 'No friends added yet. Click "Add Friend" to get started.'}
            </p>
          </CardContent>
        </Card>
      )}

      {calendarFriend && (
        <FriendCalendarModal
          friend={calendarFriend}
          activities={data.activities}
          open={!!calendarFriend}
          onOpenChange={(open) => !open && setCalendarFriend(null)}
          onUpdate={onUpdate}
        />
      )}

      {taggedCommentsFriend && (
        <TaggedCommentsModal
          friend={taggedCommentsFriend}
          open={!!taggedCommentsFriend}
          onOpenChange={(open) => !open && setTaggedCommentsFriend(null)}
        />
      )}
    </div>
  )
}
