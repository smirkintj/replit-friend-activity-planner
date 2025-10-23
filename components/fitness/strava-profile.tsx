"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Award, TrendingUp, X } from "lucide-react"
import { format } from "date-fns"

interface StravaProfileProps {
  friendId: string
  friendName: string
}

interface ProfileData {
  profile: {
    id: number
    username: string
    firstname: string
    lastname: string
    city: string
    state: string
    country: string
    sex: string
    premium: boolean
    summit: boolean
    createdAt: string
    profilePhoto: string
    weight: number
    bio: string
  }
  stats: {
    allTime: {
      runs: { count: number; distance: number; movingTime: number; elevationGain: number }
      rides: { count: number; distance: number; movingTime: number; elevationGain: number }
      swims: { count: number; distance: number; movingTime: number }
    }
    ytd: {
      runs: { count: number; distance: number; movingTime: number; elevationGain: number }
      rides: { count: number; distance: number; movingTime: number; elevationGain: number }
      swims: { count: number; distance: number; movingTime: number }
    }
    recent: {
      runs: { count: number; distance: number; movingTime: number; elevationGain: number }
      rides: { count: number; distance: number; movingTime: number; elevationGain: number }
      swims: { count: number; distance: number; movingTime: number }
    }
  }
}

export function StravaProfile({ friendId, friendName }: StravaProfileProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/strava/profile?friendId=${friendId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load Strava profile')
      }
      
      const data = await response.json()
      setProfileData(data)
      setShowProfile(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!showProfile) {
    return (
      <Button
        onClick={loadProfile}
        disabled={isLoading}
        variant="outline"
        className="w-full"
        style={{
          background: 'rgba(252, 76, 2, 0.1)',
          borderColor: 'rgba(252, 76, 2, 0.3)',
          color: '#fc4c02'
        }}
      >
        {isLoading ? 'Loading...' : '🔍 View Your Strava Profile'}
      </Button>
    )
  }

  if (error || !profileData) {
    return (
      <Card className="backdrop-blur-lg border"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}>
        <CardContent className="pt-6">
          <p className="text-red-400 text-center">{error || 'Failed to load profile'}</p>
          <Button onClick={() => setShowProfile(false)} className="w-full mt-4" variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { profile, stats } = profileData
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')

  return (
    <Card className="backdrop-blur-lg border overflow-hidden"
          style={{
            background: 'rgba(15, 20, 45, 0.6)',
            borderColor: 'rgba(252, 76, 2, 0.3)',
            boxShadow: '0 0 30px rgba(252, 76, 2, 0.15)'
          }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg" alt="Strava" className="h-6" />
            Your Strava Profile
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowProfile(false)}>
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-2"
                  style={{ borderColor: '#fc4c02' }}>
            <AvatarImage src={profile.profilePhoto} alt={profile.firstname} />
            <AvatarFallback style={{ background: 'linear-gradient(135deg, #fc4c02 0%, #ff6b35 100%)' }}>
              {profile.firstname?.[0]}{profile.lastname?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">
              {profile.firstname} {profile.lastname}
            </h3>
            <p className="text-sm text-gray-400">@{profile.username}</p>
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {profile.premium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  ⭐ Premium
                </Badge>
              )}
              {location && (
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Calendar className="h-3 w-3" />
              Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
            </div>
          </div>
        </div>

        {/* Stats Tabs */}
        {stats && (
          <div className="space-y-4">
            {/* All-Time Stats */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                ALL-TIME TOTALS
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {/* Runs */}
                {stats.allTime.runs.count > 0 && (
                  <div className="p-3 rounded-lg text-center"
                       style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div className="text-2xl mb-1">🏃</div>
                    <div className="text-lg font-bold text-white">{stats.allTime.runs.count}</div>
                    <div className="text-xs text-gray-400">Runs</div>
                    <div className="text-sm text-gray-300 mt-1">{stats.allTime.runs.distance.toLocaleString()} km</div>
                  </div>
                )}
                
                {/* Rides */}
                {stats.allTime.rides.count > 0 && (
                  <div className="p-3 rounded-lg text-center"
                       style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div className="text-2xl mb-1">🚴</div>
                    <div className="text-lg font-bold text-white">{stats.allTime.rides.count}</div>
                    <div className="text-xs text-gray-400">Rides</div>
                    <div className="text-sm text-gray-300 mt-1">{stats.allTime.rides.distance.toLocaleString()} km</div>
                  </div>
                )}
                
                {/* Swims */}
                {stats.allTime.swims.count > 0 && (
                  <div className="p-3 rounded-lg text-center"
                       style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                    <div className="text-2xl mb-1">🏊</div>
                    <div className="text-lg font-bold text-white">{stats.allTime.swims.count}</div>
                    <div className="text-xs text-gray-400">Swims</div>
                    <div className="text-sm text-gray-300 mt-1">{stats.allTime.swims.distance.toLocaleString()} km</div>
                  </div>
                )}
              </div>
            </div>

            {/* Year-to-Date Stats */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                THIS YEAR (2025)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {stats.ytd.runs.count > 0 && (
                  <div className="p-3 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <div className="text-xl font-bold text-white">{stats.ytd.runs.count}</div>
                    <div className="text-xs text-gray-400">Runs</div>
                    <div className="text-sm text-gray-300">{stats.ytd.runs.distance} km</div>
                  </div>
                )}
                {stats.ytd.rides.count > 0 && (
                  <div className="p-3 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <div className="text-xl font-bold text-white">{stats.ytd.rides.count}</div>
                    <div className="text-xs text-gray-400">Rides</div>
                    <div className="text-sm text-gray-300">{stats.ytd.rides.distance} km</div>
                  </div>
                )}
                {stats.ytd.swims.count > 0 && (
                  <div className="p-3 rounded-lg"
                       style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                    <div className="text-xl font-bold text-white">{stats.ytd.swims.count}</div>
                    <div className="text-xs text-gray-400">Swims</div>
                    <div className="text-sm text-gray-300">{stats.ytd.swims.distance} km</div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Hours */}
            <div className="p-4 rounded-lg text-center"
                 style={{
                   background: 'linear-gradient(135deg, rgba(252, 76, 2, 0.2) 0%, rgba(255, 107, 53, 0.2) 100%)',
                   border: '2px solid rgba(252, 76, 2, 0.4)'
                 }}>
              <div className="text-sm text-gray-300 mb-1">Total Active Hours (All-Time)</div>
              <div className="text-3xl font-bold text-orange-400">
                {(stats.allTime.runs.movingTime + stats.allTime.rides.movingTime + stats.allTime.swims.movingTime).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">Hours of movement</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
