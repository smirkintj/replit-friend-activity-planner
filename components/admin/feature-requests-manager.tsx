"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock, XCircle, Sparkles, User, Zap, Plus, ThumbsUp } from "lucide-react"
import {
  getFeatureRequests,
  updateFeatureRequestStatus,
  getBacklogItems,
  createBacklogItem,
  voteBacklogItem,
  getFriends,
} from "@/lib/storage"
import type { FeatureRequest, BacklogItem, Friend } from "@/lib/types"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { BacklogDetailModal } from "@/components/backlog-detail-modal"

const REJECTION_REASONS = [
  "Not feasible with current technology",
  "Out of scope for this project",
  "Duplicate of existing feature",
  "Security concerns",
  "Performance impact too high",
  "Better alternative exists",
  "Other (see notes)",
]

const AI_SUGGESTED_IDEAS: Omit<BacklogItem, "id" | "createdAt" | "votes">[] = [
  {
    title: "User Authentication & Login System",
    description: "Implement a simple PIN-based authentication system for friends to access personalized features",
    category: "Security",
    complexity: "High",
    impact: "High",
    source: "ai",
  },
  {
    title: "Export to Calendar (iCal/Google)",
    description: "Allow users to export trips and activities to their personal calendars",
    category: "Integration",
    complexity: "Medium",
    impact: "High",
    source: "ai",
  },
  {
    title: "Email/Push Notifications",
    description: "Send reminders when friends update availability or trips are approaching",
    category: "Notifications",
    complexity: "High",
    impact: "High",
    source: "ai",
  },
  {
    title: "Shared Expense Tracker",
    description: "Track and split costs for group trips with automatic calculations",
    category: "Planning",
    complexity: "Medium",
    impact: "High",
    source: "ai",
  },
  {
    title: "Weather Integration",
    description: "Show weather forecasts for trip destinations and dates",
    category: "Integration",
    complexity: "Low",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Photo Gallery",
    description: "Upload and share photos from past trips with friends",
    category: "Social",
    complexity: "Medium",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Recurring Activities",
    description: "Support for weekly/monthly recurring events and meetups",
    category: "Planning",
    complexity: "Medium",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Voting System for Dates",
    description: "Let friends vote on potential trip dates or destinations",
    category: "Social",
    complexity: "Low",
    impact: "High",
    source: "ai",
  },
  {
    title: "Group Chat Integration",
    description: "Link to WhatsApp/Telegram groups for each trip",
    category: "Integration",
    complexity: "Low",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Privacy Controls",
    description: "Let friends control who can see their availability",
    category: "Security",
    complexity: "Medium",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Mobile App (PWA)",
    description: "Progressive Web App for better mobile experience with offline support",
    category: "Platform",
    complexity: "High",
    impact: "High",
    source: "ai",
  },
  {
    title: "Trip Templates",
    description: "Save and reuse trip templates for common destinations",
    category: "Planning",
    complexity: "Low",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Activity Suggestions",
    description: "AI-powered suggestions for activities based on location and interests",
    category: "AI",
    complexity: "High",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Friend Availability Heatmap",
    description: "Visual heatmap showing when most friends are available",
    category: "Visualization",
    complexity: "Medium",
    impact: "Medium",
    source: "ai",
  },
  {
    title: "Trip Memories Timeline",
    description: "Chronological timeline of past trips with photos and notes",
    category: "Social",
    complexity: "Medium",
    impact: "Low",
    source: "ai",
  },
  {
    title: "Collaborative Itinerary Planning",
    description: "Real-time collaborative editing of trip itineraries",
    category: "Planning",
    complexity: "High",
    impact: "High",
    source: "ai",
  },
]

export function FeatureRequestsManager() {
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<FeatureRequest | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([])
  const [isLoadingBacklog, setIsLoadingBacklog] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])

  const [showCreateBacklog, setShowCreateBacklog] = useState(false)
  const [newBacklogTitle, setNewBacklogTitle] = useState("")
  const [newBacklogDescription, setNewBacklogDescription] = useState("")
  const [newBacklogCategory, setNewBacklogCategory] = useState("Planning")
  const [newBacklogComplexity, setNewBacklogComplexity] = useState("Medium")
  const [newBacklogImpact, setNewBacklogImpact] = useState("Medium")

  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [votingItem, setVotingItem] = useState<BacklogItem | null>(null)
  const [selectedFriendForVote, setSelectedFriendForVote] = useState("")

  const [selectedBacklogItem, setSelectedBacklogItem] = useState<BacklogItem | null>(null)
  const [showBacklogDetail, setShowBacklogDetail] = useState(false)

  useEffect(() => {
    loadRequests()
    loadBacklog()
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const data = await getFriends()
      setFriends(data)
    } catch (err) {
      console.error("[v0] Error loading friends:", err)
    }
  }

  const loadRequests = async () => {
    try {
      console.log("[v0] Loading feature requests...")
      setIsLoading(true)
      setError(null)
      const data = await getFeatureRequests()
      console.log("[v0] Feature requests loaded:", data.length)
      setRequests(data)
    } catch (err) {
      console.error("[v0] Error loading feature requests:", err)
      setError("Failed to load feature requests. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadBacklog = async () => {
    try {
      setIsLoadingBacklog(true)
      const items = await getBacklogItems()
      setBacklogItems(items)
    } catch (err) {
      console.error("[v0] Error loading backlog:", err)
    } finally {
      setIsLoadingBacklog(false)
    }
  }

  const handleStatusChange = async (id: string, status: "pending" | "deployed" | "rejected", reason?: string) => {
    try {
      console.log("[v0] Updating feature request status:", { id, status, reason })
      await updateFeatureRequestStatus(id, status, reason)
      await loadRequests()
      console.log("[v0] Feature request status updated successfully")
    } catch (err) {
      console.error("[v0] Error updating feature request:", err)
      setError("Failed to update feature request. Please try again.")
    }
  }

  const handleReject = async () => {
    if (!rejectingRequest || !selectedReason) return
    await handleStatusChange(rejectingRequest.id, "rejected", selectedReason)
    setRejectingRequest(null)
    setSelectedReason("")
  }

  const handleCreateBacklog = async () => {
    if (!newBacklogTitle || !newBacklogDescription) return

    try {
      await createBacklogItem({
        title: newBacklogTitle,
        description: newBacklogDescription,
        category: newBacklogCategory,
        complexity: newBacklogComplexity as "Low" | "Medium" | "High",
        impact: newBacklogImpact as "Low" | "Medium" | "High",
        source: "admin",
      })

      // Reset form
      setNewBacklogTitle("")
      setNewBacklogDescription("")
      setNewBacklogCategory("Planning")
      setNewBacklogComplexity("Medium")
      setNewBacklogImpact("Medium")
      setShowCreateBacklog(false)

      // Reload backlog
      await loadBacklog()
    } catch (err) {
      console.error("[v0] Error creating backlog item:", err)
    }
  }

  const handleVote = async () => {
    if (!votingItem || !selectedFriendForVote) return

    try {
      await voteBacklogItem(votingItem.id, selectedFriendForVote)
      setShowVoteModal(false)
      setVotingItem(null)
      setSelectedFriendForVote("")
      await loadBacklog()
    } catch (err) {
      console.error("[v0] Error voting:", err)
    }
  }

  const handleOpenBacklogDetail = (item: BacklogItem) => {
    setSelectedBacklogItem(item)
    setShowBacklogDetail(true)
  }

  const handleVoteFromDetail = (item: BacklogItem) => {
    setShowBacklogDetail(false)
    setVotingItem(item)
    setShowVoteModal(true)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Low":
        return "bg-green-500/10 text-green-700 border-green-200"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200"
      case "High":
        return "bg-red-500/10 text-red-700 border-red-200"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200"
    }
  }

  const isFeatureImplemented = (title: string) => {
    return title === "Recurring Activities" // Add more as features are implemented
  }

  const allBacklogItems = [
    ...AI_SUGGESTED_IDEAS.map((item, index) => ({
      ...item,
      id: `ai-${index}`,
      createdAt: new Date().toISOString(),
      votes: 0,
    })),
    ...backlogItems,
  ]

  const filteredBacklogItems =
    categoryFilter === "All" ? allBacklogItems : allBacklogItems.filter((item) => item.category === categoryFilter)

  const categories = ["All", ...Array.from(new Set(allBacklogItems.map((item) => item.category)))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading feature requests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadRequests}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Feature Requests</h2>
        <p className="text-sm text-muted-foreground">Manage feature requests and explore backlog ideas</p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="backlog" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Backlog Ideas ({allBacklogItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-3 mt-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No feature requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Card key={request.id} className="shadow-sm border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                            <User className="h-3 w-3 mr-1" />
                            User Request
                          </Badge>
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          <Badge
                            variant={
                              request.status === "deployed"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              request.status === "deployed"
                                ? "bg-green-500/10 text-green-700 border-green-200"
                                : request.status === "rejected"
                                  ? "bg-red-500/10 text-red-700 border-red-200"
                                  : "bg-orange-500/10 text-orange-700 border-orange-200"
                            }
                          >
                            {request.status === "deployed" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Deployed
                              </>
                            ) : request.status === "rejected" ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                        {request.rejectionReason && (
                          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            <strong>Rejection reason:</strong> {request.rejectionReason}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Submitted {format(new Date(request.createdAt), "MMM d, yyyy")}
                          {request.statusUpdatedAt &&
                            ` • Updated ${format(new Date(request.statusUpdatedAt), "MMM d, yyyy")}`}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {request.status !== "deployed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(request.id, "deployed")}
                            className="text-green-600 hover:text-green-700"
                          >
                            Deploy
                          </Button>
                        )}
                        {request.status !== "rejected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectingRequest(request)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        )}
                        {request.status !== "pending" && (
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(request.id, "pending")}>
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="backlog" className="space-y-3 mt-4">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Backlog & Feature Ideas
                </CardTitle>
                <Button onClick={() => setShowCreateBacklog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Idea
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Vote on features you'd like to see implemented. AI-suggested features are curated recommendations, while
                admin-created items are custom ideas.
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Suggested
                  </Badge>
                  <span className="text-xs text-muted-foreground">= Curated by AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    Admin Created
                  </Badge>
                  <span className="text-xs text-muted-foreground">= Custom idea</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                  Low
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
                  Medium
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
                  High
                </Badge>
                <span className="text-muted-foreground">= Complexity level</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Label>Filter by category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoadingBacklog ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading backlog items...</p>
            </div>
          ) : filteredBacklogItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No backlog items match your filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredBacklogItems.map((item) => (
                <Card
                  key={item.id}
                  className="shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenBacklogDetail(item)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={
                                item.source === "ai"
                                  ? "bg-purple-500/10 text-purple-700 border-purple-200"
                                  : "bg-blue-500/10 text-blue-700 border-blue-200"
                              }
                            >
                              {item.source === "ai" ? (
                                <>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI Suggested
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3 mr-1" />
                                  Admin Created
                                </>
                              )}
                            </Badge>
                            <Badge variant="outline" className={getComplexityColor(item.complexity)}>
                              <Zap className="h-3 w-3 mr-1" />
                              {item.complexity}
                            </Badge>
                            {isFeatureImplemented(item.title) && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                            <span className="text-muted-foreground">Impact: {item.impact}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          setVotingItem(item)
                          setShowVoteModal(true)
                        }}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Vote ({item.votes})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateBacklog} onOpenChange={setShowCreateBacklog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Backlog Idea</DialogTitle>
            <DialogDescription>Create a new feature idea for the backlog</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newBacklogTitle}
                onChange={(e) => setNewBacklogTitle(e.target.value)}
                placeholder="Feature title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newBacklogDescription}
                onChange={(e) => setNewBacklogDescription(e.target.value)}
                placeholder="Describe the feature"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newBacklogCategory} onValueChange={setNewBacklogCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Integration">Integration</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Notifications">Notifications</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Platform">Platform</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="Visualization">Visualization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complexity">Complexity</Label>
                <Select value={newBacklogComplexity} onValueChange={setNewBacklogComplexity}>
                  <SelectTrigger id="complexity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Impact</Label>
              <Select value={newBacklogImpact} onValueChange={setNewBacklogImpact}>
                <SelectTrigger id="impact">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBacklog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBacklog} disabled={!newBacklogTitle || !newBacklogDescription}>
              Create Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVoteModal} onOpenChange={setShowVoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote for Feature</DialogTitle>
            <DialogDescription>Select which friend you are to vote for "{votingItem?.title}"</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFriendForVote} onValueChange={setSelectedFriendForVote}>
              <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote} disabled={!selectedFriendForVote}>
              Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectingRequest} onOpenChange={(open) => !open && setRejectingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Feature Request</DialogTitle>
            <DialogDescription>Please select a reason for rejecting "{rejectingRequest?.title}"</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rejection reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingRequest(null)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!selectedReason} variant="destructive">
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BacklogDetailModal
        item={selectedBacklogItem}
        isOpen={showBacklogDetail}
        onClose={() => setShowBacklogDetail(false)}
        onVote={handleVoteFromDetail}
      />
    </div>
  )
}
