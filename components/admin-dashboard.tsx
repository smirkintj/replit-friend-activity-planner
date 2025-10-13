"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FriendsManager } from "@/components/admin/friends-manager"
import { GroupsManager } from "@/components/admin/groups-manager"
import { ActivitiesManager } from "@/components/admin/activities-manager"
import { PendingRequests } from "@/components/admin/pending-requests"
import { FeatureRequestsManager } from "@/components/admin/feature-requests-manager"
import { JoinRequestsManager } from "@/components/admin/join-requests-manager"
import { ActivityLogManager } from "@/components/admin/activity-log-manager"
import { getStoredData, getLoggedInFriendId, getLoggedInFriendName, setFriendLogout } from "@/lib/storage"
import type { AppData, Activity } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ActivitiesListView } from "@/components/admin/activities-list-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus, Lock } from "lucide-react"

export function AdminDashboard() {
  const [data, setData] = useState<AppData>({ friends: [], groups: [], activities: [], pendingRequests: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinRequests, setShowJoinRequests] = useState(true)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [loggedInFriendId, setLoggedInFriendId] = useState<string | null>(null)
  const [loggedInFriendName, setLoggedInFriendName] = useState<string | null>(null)

  useEffect(() => {
    // Get logged in friend ID and name
    setLoggedInFriendId(getLoggedInFriendId())
    setLoggedInFriendName(getLoggedInFriendName())
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const result = await getStoredData()
      setData(result)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const refreshData = async () => {
    const result = await getStoredData()
    setData(result)
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowCreateForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleFormClose = () => {
    setShowCreateForm(false)
    setEditingActivity(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const pendingCount = data.pendingRequests?.length || 0

  return (
    <Tabs defaultValue="people" className="w-full">
      <TabsList className="grid w-full grid-cols-4 max-w-4xl">
        <TabsTrigger value="people">People</TabsTrigger>
        <TabsTrigger value="activities">Activities & Trips</TabsTrigger>
        <TabsTrigger value="requests" className="relative">
          Requests
          {pendingCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
      </TabsList>

      <TabsContent value="people" className="mt-6">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="friends">
            <FriendsManager data={data} onUpdate={refreshData} />
          </TabsContent>
          <TabsContent value="groups">
            <GroupsManager data={data} onUpdate={refreshData} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setShowJoinRequests(!showJoinRequests)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Join Requests</CardTitle>
                <Button variant="ghost" size="sm">
                  {showJoinRequests ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showJoinRequests && (
              <CardContent>
                <JoinRequestsManager data={data} onUpdate={refreshData} />
              </CardContent>
            )}
          </Card>

          {!showCreateForm ? (
            <Button onClick={() => setShowCreateForm(true)} className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create New Activity
            </Button>
          ) : (
            <div ref={formRef}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{editingActivity ? "Edit Activity" : "Create Activity"}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleFormClose}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivitiesManager
                    data={data}
                    onUpdate={() => {
                      refreshData()
                      handleFormClose()
                    }}
                    editingActivity={editingActivity}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-4">All Activities</h3>
            <ActivitiesListView
              activities={data.activities}
              friends={data.friends}
              onEdit={handleEditActivity}
              onUpdate={refreshData}
              loggedInFriendId={loggedInFriendId}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="requests" className="mt-6">
        <Tabs defaultValue="trip-requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
            <TabsTrigger value="trip-requests" className="relative">
              Trip Requests
              {pendingCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feature-requests">Feature Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="trip-requests">
            <PendingRequests data={data} onUpdate={refreshData} />
          </TabsContent>
          <TabsContent value="feature-requests">
            <FeatureRequestsManager />
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="activity-log" className="mt-6">
        <ActivityLogManager />
      </TabsContent>
    </Tabs>
  )
}
