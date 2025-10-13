"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, CheckCircle2, Clock, ArrowLeft, XCircle } from "lucide-react"
import { getFeatureRequests, submitFeatureRequest } from "@/lib/storage" // Removed updateFeatureRequestStatus - only admin can update
import type { FeatureRequest } from "@/lib/types"
import Link from "next/link"
import { format } from "date-fns"

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const data = await getFeatureRequests()
    setRequests(data)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    try {
      await submitFeatureRequest({ title, description })
      setTitle("")
      setDescription("")
      await loadRequests()
    } catch (error) {
      console.error("Error submitting feature request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Feature Requests</h1>
                <p className="text-sm text-muted-foreground">Suggest improvements and see what's coming</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Submit Form */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Submit a Feature Request
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="text-sm font-medium mb-2 block">
                    Feature Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g., Add export to calendar feature"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe the feature you'd like to see..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">All Requests</h2>
            {requests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No feature requests yet. Be the first to suggest one!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} className="shadow-sm border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
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
                          </p>
                        </div>
                      </div>
                      {/* </CHANGE> */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
