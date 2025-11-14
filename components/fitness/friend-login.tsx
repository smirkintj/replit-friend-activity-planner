"use client"

import { useState, useEffect } from "react"
import { User, Lock, LogIn } from "lucide-react"
import { getFriends } from "@/lib/storage"
import type { Friend } from "@/lib/types"

interface FriendLoginProps {
  onLogin: (friend: Friend) => void
}

export function FriendLogin({ onLogin }: FriendLoginProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriendId, setSelectedFriendId] = useState<string>("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFriends()
  }, [])

  async function loadFriends() {
    const allFriends = await getFriends()
    setFriends(allFriends.sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedFriendId) {
      setError("Please select a friend")
      return
    }

    if (!pin || pin.length !== 4) {
      setError("Please enter a 4-digit PIN")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          friendId: selectedFriendId,
          pin: pin 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const friend = friends.find(f => f.id === selectedFriendId)
        if (friend) {
          // Store in session storage (including PIN for API auth)
          sessionStorage.setItem('fitness_friend_id', friend.id)
          sessionStorage.setItem('fitness_friend_name', friend.name)
          sessionStorage.setItem('fitness_friend_pin', pin) // Store PIN for API calls
          onLogin(friend)
        }
      } else {
        setError("Incorrect PIN. Please try again.")
        setPin("")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
         }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full mb-4"
               style={{
                 background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                 boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
               }}>
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
            FitSquad Login
          </h1>
          <p className="text-gray-400">Choose your profile to continue</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl rounded-2xl p-8 border"
             style={{
               background: 'rgba(255, 255, 255, 0.05)',
               borderColor: 'rgba(139, 92, 246, 0.2)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
             }}>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Friend Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Your Profile
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedFriendId}
                  onChange={(e) => {
                    setSelectedFriendId(e.target.value)
                    setError("")
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <option value="" className="bg-gray-900">Choose a friend...</option>
                  {friends.map(friend => (
                    <option key={friend.id} value={friend.id} className="bg-gray-900">
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Your PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''))
                    setError("")
                  }}
                  placeholder="••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white/5 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm text-red-300"
                   style={{
                     background: 'rgba(239, 68, 68, 0.1)',
                     border: '1px solid rgba(239, 68, 68, 0.3)'
                   }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedFriendId || pin.length !== 4}
              className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Enter FitSquad</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't know your PIN? Contact the admin.
        </p>
      </div>
    </div>
  )
}
