"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setFriendLogin } from "@/lib/storage"
import { Lock, User } from "lucide-react"

interface AdminLoginProps {
  onLogin: () => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: null,
          pin: pin,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFriendLogin(data.role, data.friendId, data.friendName)
        onLogin()
      } else {
        setError(data.message || "Salah PIN lah!")
        setPin("")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
      setPin("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Enter your PIN to access the admin portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">PIN</label>
              <Input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError("")
                }}
                className="w-full"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting || !pin}>
              <Lock className="h-4 w-4 mr-2" />
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
