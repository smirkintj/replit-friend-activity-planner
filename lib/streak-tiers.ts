// Perpetual streak tier system with unique cosmetic rewards

import type { CSSProperties } from 'react'

export interface StreakTier {
  name: string
  days: number
  emoji: string
  color: string
  description: string
  // Cosmetic benefits
  nameEffect: {
    type: 'none' | 'gradient' | 'animated-gradient' | 'shimmer' | 'prism' | 'thunderstorm'
    colors: string[]
    animation?: string
  }
  profileFrame?: {
    type: 'none' | 'basic' | 'holographic' | 'royal' | 'cosmic'
    color: string
    glow: boolean
  }
  nameTag?: {
    icon: string
    color: string
    label: string
  }
  hoverEffect?: 'none' | 'confetti' | 'sparkles' | 'lightning' | 'fireworks'
  particles?: 'none' | 'sparks' | 'crystals' | 'crowns' | 'cosmic'
  entryAnimation?: 'none' | 'fade' | 'spotlight' | 'thunder-strike'
  specialEffect?: string // Additional unique effect description
}

export const STREAK_TIERS: StreakTier[] = [
  {
    name: 'Rookie',
    days: 7,
    emoji: '🥉',
    color: '#cd7f32',
    description: '1 week streak - Baru nak start!',
    nameEffect: {
      type: 'none',
      colors: ['#cd7f32']
    },
    profileFrame: {
      type: 'basic',
      color: '#cd7f32',
      glow: false
    },
    nameTag: {
      icon: '🔥',
      color: '#cd7f32',
      label: 'Rookie'
    },
    hoverEffect: 'sparkles',
    particles: 'sparks',
    entryAnimation: 'fade',
    specialEffect: 'Bronze spark pulse on name'
  },
  {
    name: 'Committed',
    days: 30,
    emoji: '🥈',
    color: '#c0c0c0',
    description: '30 hari berturut-turut - Dah committed ni!',
    nameEffect: {
      type: 'gradient',
      colors: ['#c0c0c0', '#e8e8e8', '#c0c0c0']
    },
    profileFrame: {
      type: 'basic',
      color: '#c0c0c0',
      glow: true
    },
    nameTag: {
      icon: '⚡',
      color: '#c0c0c0',
      label: 'Committed'
    },
    hoverEffect: 'confetti',
    particles: 'sparks',
    entryAnimation: 'fade',
    specialEffect: 'Silver gradient name + confetti burst on hover'
  },
  {
    name: 'Champion',
    days: 60,
    emoji: '🥇',
    color: '#fbbf24',
    description: '60 hari - JUARA! 🏆',
    nameEffect: {
      type: 'animated-gradient',
      colors: ['#fbbf24', '#f59e0b', '#fbbf24'],
      animation: 'gold-shimmer'
    },
    profileFrame: {
      type: 'basic',
      color: '#fbbf24',
      glow: true
    },
    nameTag: {
      icon: '🏆',
      color: '#fbbf24',
      label: 'Champion'
    },
    hoverEffect: 'sparkles',
    particles: 'sparks',
    entryAnimation: 'fade',
    specialEffect: 'Animated gold underline + trophy ping effect + badge flare'
  },
  {
    name: 'Legend',
    days: 90,
    emoji: '💎',
    color: '#8b5cf6',
    description: '90 hari - Dah jadi LEGEND! 💎',
    nameEffect: {
      type: 'prism',
      colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#a78bfa', '#8b5cf6'],
      animation: 'prism-shimmer'
    },
    profileFrame: {
      type: 'holographic',
      color: '#8b5cf6',
      glow: true
    },
    nameTag: {
      icon: '💎',
      color: '#8b5cf6',
      label: 'Legend'
    },
    hoverEffect: 'sparkles',
    particles: 'crystals',
    entryAnimation: 'fade',
    specialEffect: 'Amethyst prism name shimmer + floating crystal particles + holographic profile frame'
  },
  {
    name: 'Immortal',
    days: 120,
    emoji: '👑',
    color: '#ec4899',
    description: '120 hari - TAK BOLEH STOP! 👑',
    nameEffect: {
      type: 'animated-gradient',
      colors: ['#ec4899', '#f472b6', '#fbbf24', '#f472b6', '#ec4899'],
      animation: 'royal-flow'
    },
    profileFrame: {
      type: 'royal',
      color: '#ec4899',
      glow: true
    },
    nameTag: {
      icon: '👑',
      color: '#ec4899',
      label: 'Immortal'
    },
    hoverEffect: 'fireworks',
    particles: 'crowns',
    entryAnimation: 'spotlight',
    specialEffect: 'Royal neon gradient + orbiting crown sprites + spotlight entry + animated badge trail'
  },
  {
    name: 'Godlike',
    days: 180,
    emoji: '⚡',
    color: '#10b981',
    description: '6 BULAN!! GILA BETUL!! ⚡🔥',
    nameEffect: {
      type: 'thunderstorm',
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      animation: 'thunderstorm'
    },
    profileFrame: {
      type: 'cosmic',
      color: '#10b981',
      glow: true
    },
    nameTag: {
      icon: '⚡',
      color: '#10b981',
      label: 'GODLIKE'
    },
    hoverEffect: 'lightning',
    particles: 'cosmic',
    entryAnimation: 'thunder-strike',
    specialEffect: 'Thunderstorm gradient text + lightning crackle + dynamic aura background + cosmic particles + legendary medallion'
  }
]

// Get current tier based on streak days
export function getCurrentStreakTier(streakDays: number): StreakTier {
  // Find the highest tier the user has achieved
  const achievedTiers = STREAK_TIERS.filter(tier => streakDays >= tier.days)
  
  if (achievedTiers.length === 0) {
    // Below first tier, return a default
    return {
      name: 'Newbie',
      days: 0,
      emoji: '🔰',
      color: '#6b7280',
      description: 'Baru je start - jom workout!',
      nameEffect: {
        type: 'none',
        colors: ['#6b7280']
      },
      profileFrame: {
        type: 'none',
        color: '#6b7280',
        glow: false
      },
      hoverEffect: 'none',
      particles: 'none',
      entryAnimation: 'none',
      specialEffect: 'None yet - complete 7 days to unlock!'
    }
  }
  
  // Return the highest achieved tier
  return achievedTiers[achievedTiers.length - 1]
}

// Get next tier to aim for
export function getNextStreakTier(streakDays: number): StreakTier | null {
  const nextTier = STREAK_TIERS.find(tier => streakDays < tier.days)
  return nextTier || null
}

// Calculate days until next tier
export function getDaysUntilNextTier(streakDays: number): number {
  const nextTier = getNextStreakTier(streakDays)
  return nextTier ? nextTier.days - streakDays : 0
}

// Get CSS class for name effect
export function getStreakNameClass(tier: StreakTier): string {
  switch (tier.nameEffect.type) {
    case 'gradient':
      return 'streak-gradient'
    case 'animated-gradient':
      return `streak-animated-gradient ${tier.nameEffect.animation}`
    case 'shimmer':
      return 'streak-shimmer'
    case 'prism':
      return 'streak-prism'
    case 'thunderstorm':
      return 'streak-thunderstorm'
    default:
      return ''
  }
}

// Get inline style for name effect
export function getStreakNameStyle(tier: StreakTier): CSSProperties {
  const { nameEffect } = tier
  
  switch (nameEffect.type) {
    case 'gradient':
      return {
        background: `linear-gradient(90deg, ${nameEffect.colors.join(', ')})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }
    case 'animated-gradient':
      return {
        background: `linear-gradient(90deg, ${nameEffect.colors.join(', ')})`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }
    case 'prism':
      return {
        background: `linear-gradient(135deg, ${nameEffect.colors.join(', ')})`,
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }
    case 'thunderstorm':
      return {
        background: `linear-gradient(90deg, ${nameEffect.colors.join(', ')})`,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }
    default:
      return {
        color: tier.color,
        fontWeight: 'bold'
      }
  }
}

// Get profile frame class
export function getProfileFrameClass(tier: StreakTier): string {
  if (!tier.profileFrame) return ''
  
  const baseClass = 'streak-frame'
  const typeClass = `streak-frame-${tier.profileFrame.type}`
  const glowClass = tier.profileFrame.glow ? 'streak-frame-glow' : ''
  
  return `${baseClass} ${typeClass} ${glowClass}`.trim()
}

// Get particle effect class
export function getParticleClass(tier: StreakTier): string {
  if (!tier.particles || tier.particles === 'none') return ''
  return `streak-particles-${tier.particles}`
}
