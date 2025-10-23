"use client"

import { getCurrentStreakTier, getNextStreakTier, getDaysUntilNextTier } from "@/lib/streak-tiers"
import { Flame } from "lucide-react"

interface StreakTierBadgeProps {
  streakDays: number
  showProgress?: boolean
}

export function StreakTierBadge({ streakDays, showProgress = true }: StreakTierBadgeProps) {
  const currentTier = getCurrentStreakTier(streakDays)
  const nextTier = getNextStreakTier(streakDays)
  const daysUntil = getDaysUntilNextTier(streakDays)

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Main Tier Badge */}
      <div
        className="relative px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${currentTier.color}dd 0%, ${currentTier.color}aa 50%, ${currentTier.color}dd 100%)`,
          boxShadow: `0 4px 20px ${currentTier.color}60, 0 0 40px ${currentTier.color}30`
        }}
      >
        {/* Animated background shimmer */}
        <div
          className="absolute inset-0 rounded-xl opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentTier.color}40, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />

        {/* Tier Icon */}
        <div className="relative z-10 text-3xl filter drop-shadow-lg">
          {currentTier.emoji}
        </div>

        {/* Tier Info */}
        <div className="relative z-10">
          <div className="text-xs font-semibold text-white/80 uppercase tracking-wider">
            {currentTier.name} Tier
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {streakDays} day{streakDays !== 1 ? 's' : ''} streak
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {showProgress && nextTier && (
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">
            {daysUntil}d until
          </div>
          <div
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{
              background: `${nextTier.color}30`,
              color: nextTier.color,
              border: `1px solid ${nextTier.color}60`
            }}
          >
            {nextTier.emoji} {nextTier.name}
          </div>
        </div>
      )}
    </div>
  )
}
