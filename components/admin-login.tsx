"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStoredData } from "@/lib/storage"
import { Lock, User } from "lucide-react"
import type { Friend } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminLoginProps {
  onLogin: () => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriendId, setSelectedFriendId] = useState<string>("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFriends = async () => {
      const data = await getStoredData()
      setFriends(data.friends)
      setIsLoading(false)
    }
    loadFriends()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFriendId) {
      setError("Please select who you are")
      return
    }

    const friend = friends.find(f => f.id === selectedFriendId)
    
    if (friend && friend.pin === pin) {
      sessionStorage.setItem("logged-in-friend-id", friend.id)
      sessionStorage.setItem("logged-in-friend-name", friend.name)
      onLogin()
    } else {
      setError("Salah PIN lah!")
      setPin("")
    }
  }

  const selectedFriend = friends.find(f => f.id === selectedFriendId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Who are you?</CardTitle>
          <CardDescription>Pilih siapa kau dan masukkan PIN kau</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Your Name</label>
              <Select value={selectedFriendId} onValueChange={(value) => {
                setSelectedFriendId(value)
                setError("")
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your name..." />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={friend.imageUrl} alt={friend.name} />
                          <AvatarFallback>{friend.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{friend.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your PIN</label>
              <Input
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError("")
                }}
                className="w-full"
                disabled={!selectedFriendId}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              {selectedFriendId && (
                <p className="text-xs text-muted-foreground">
                  Default PIN is 2468 (you can change it later)
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={!selectedFriendId}>
              <Lock className="h-4 w-4 mr-2" />
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
