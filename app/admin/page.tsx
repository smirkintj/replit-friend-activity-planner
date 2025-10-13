"use client"

import { useEffect, useState } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"
import { isAuthenticated } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calendar
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  )
}
