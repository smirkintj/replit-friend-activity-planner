"use client"

import { getCurrentStreakTier, getStreakNameStyle, getStreakNameClass, getProfileFrameClass, getParticleClass } from "@/lib/streak-tiers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StreakNameDisplayProps {
  name: string
  streakDays: number
  showBadge?: boolean
  className?: string
}

export function StreakNameDisplay({ name, streakDays, showBadge = true, className = '' }: StreakNameDisplayProps) {
  const tier = getCurrentStreakTier(streakDays)
  const nameStyle = getStreakNameStyle(tier)
  const nameClass = getStreakNameClass(tier)

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={nameClass} style={nameStyle}>
        {name}
      </span>
      {showBadge && tier.nameTag && (
        <span
          className="text-xs px-1.5 py-0.5 rounded font-bold"
          style={{
            background: `${tier.nameTag.color}30`,
            color: tier.nameTag.color,
            border: `1px solid ${tier.nameTag.color}60`
          }}
          title={`${tier.name} Tier - ${streakDays} day streak!`}
        >
          {tier.nameTag.icon}
        </span>
      )}
    </span>
  )
}

interface StreakAvatarProps {
  src?: string
  name: string
  streakDays: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakAvatar({ src, name, streakDays, size = 'md', className = '' }: StreakAvatarProps) {
  const tier = getCurrentStreakTier(streakDays)
  const frameClass = getProfileFrameClass(tier)
  const particleClass = getParticleClass(tier)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  }

  return (
    <div className={`relative ${particleClass}`}>
      <Avatar
        className={`${sizeClasses[size]} ${frameClass} ${className}`}
        style={{
          borderColor: tier.profileFrame?.color || tier.color
        }}
      >
        <AvatarImage src={src} alt={name} />
        <AvatarFallback
          style={{
            background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}cc 100%)`
          }}
        >
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
