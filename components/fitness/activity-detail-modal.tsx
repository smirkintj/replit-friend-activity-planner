"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, TrendingUp, Flame, Zap, Heart, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { getActivityIcon, getActivityColor } from "@/lib/fitness-points"
import type { FitnessActivity } from "@/lib/types"

interface ActivityDetailModalProps {
  activity: (FitnessActivity & { friendName: string; friendImageUrl: string }) | null
  isOpen: boolean
  onClose: () => void
}

export function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  const [routeMapUrl, setRouteMapUrl] = useState<string | null>(null)

  useEffect(() => {
    if (activity?.stravaId && isOpen) {
      // If it's a Strava activity, we can link to it
      setRouteMapUrl(`https://www.strava.com/activities/${activity.stravaId}`)
    } else {
      setRouteMapUrl(null)
    }
  }, [activity, isOpen])

  if (!activity) return null

  const activityDate = new Date(activity.date)
  const colorClass = getActivityColor(activity.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl backdrop-blur-lg border"
                     style={{
                       background: 'rgba(15, 20, 45, 0.95)',
                       borderColor: 'rgba(139, 92, 246, 0.3)'
                     }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="text-3xl">{getActivityIcon(activity.type)}</div>
            <div>
              <div className="text-xl font-bold capitalize">
                {activity.type} Activity
              </div>
              <div className="text-sm text-gray-400 font-normal">
                {format(activityDate, 'EEEE, MMMM d, yyyy • h:mm a')}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Athlete Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg"
               style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <Avatar className="h-12 w-12 border-2"
                    style={{ borderColor: '#8b5cf6' }}>
              <AvatarImage src={activity.friendImageUrl} alt={activity.friendName} />
              <AvatarFallback style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
                {activity.friendName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-white">{activity.friendName}</div>
              <div className="text-sm text-gray-400">
                <Badge className="border-0 text-white px-2 py-0"
                       style={{
                         background: activity.source === 'strava' ? 'linear-gradient(135deg, #fc4c02 0%, #ff6b35 100%)' :
                                   activity.source === 'apple_health' ? 'linear-gradient(135deg, #000 0%, #333 100%)' :
                                   'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                       }}>
                  {activity.source === 'strava' && '📱 Strava'}
                  {activity.source === 'apple_health' && '⌚ Apple Health'}
                  {activity.source === 'manual' && '✍️ Manual Entry'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg text-center"
                 style={{ background: 'rgba(139, 92, 246, 0.15)', border: '2px solid rgba(139, 92, 246, 0.4)' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <div className="text-xs text-gray-400">POINTS</div>
              </div>
              <div className="text-3xl font-bold text-white">{activity.points}</div>
            </div>

            <div className="p-4 rounded-lg text-center"
                 style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <div className="text-xs text-gray-400">DURATION</div>
              </div>
              <div className="text-2xl font-bold text-white">{activity.duration}</div>
              <div className="text-xs text-gray-400">minutes</div>
            </div>

            {activity.distance && activity.distance > 0 && (
              <div className="p-4 rounded-lg text-center"
                   style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <div className="text-xs text-gray-400">DISTANCE</div>
                </div>
                <div className="text-2xl font-bold text-white">{activity.distance.toFixed(2)}</div>
                <div className="text-xs text-gray-400">km</div>
              </div>
            )}

            {activity.calories && activity.calories > 0 && (
              <div className="p-4 rounded-lg text-center"
                   style={{ background: 'rgba(251, 146, 60, 0.1)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <div className="text-xs text-gray-400">CALORIES</div>
                </div>
                <div className="text-2xl font-bold text-white">{activity.calories}</div>
                <div className="text-xs text-gray-400">kcal</div>
              </div>
            )}

            {activity.heartRate && activity.heartRate > 0 && (
              <div className="p-4 rounded-lg text-center"
                   style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-400" />
                  <div className="text-xs text-gray-400">AVG HR</div>
                </div>
                <div className="text-2xl font-bold text-white">{activity.heartRate}</div>
                <div className="text-xs text-gray-400">bpm</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {activity.notes && (
            <div className="p-4 rounded-lg"
                 style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="text-xs font-semibold text-gray-400 mb-2">NOTES</div>
              <div className="text-white">{activity.notes}</div>
            </div>
          )}

          {/* Strava Link */}
          {routeMapUrl && activity.source === 'strava' && (
            <a
              href={routeMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 rounded-lg transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 76, 2, 0.2) 0%, rgba(255, 107, 53, 0.2) 100%)',
                border: '2px solid rgba(252, 76, 2, 0.4)'
              }}
            >
              <ExternalLink className="h-5 w-5 text-orange-400" />
              <span className="text-white font-semibold">View Route on Strava</span>
            </a>
          )}

          {/* Performance Summary */}
          {activity.distance && activity.distance > 0 && (
            <div className="p-4 rounded-lg text-center"
                 style={{
                   background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                   border: '2px solid rgba(139, 92, 246, 0.4)'
                 }}>
              <div className="text-sm text-gray-300 mb-1">PACE</div>
              <div className="text-2xl font-bold text-white">
                {(activity.duration / activity.distance).toFixed(1)} min/km
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
