/**
 * Points-based tier system for FitSquad
 * 
 * Similar to streak tiers, but based on weekly points earned
 * Rewards consistent effort and intensity throughout the week
 */

export interface PointsTier {
  id: string
  name: string
  minPoints: number
  emoji: string
  color: string // Gradient start color
  colorEnd: string // Gradient end color
  description: string
  cosmetics: {
    glow: boolean
    particles: boolean
    animation: string | null
    gradientText: boolean
    profileFrame: string | null
  }
}

export const POINTS_TIERS: PointsTier[] = [
  {
    id: "beginner",
    name: "Beginner",
    minPoints: 50,
    emoji: "🌱",
    color: "#10b981", // Green
    colorEnd: "#34d399",
    description: "Getting started on your fitness journey",
    cosmetics: {
      glow: false,
      particles: false,
      animation: null,
      gradientText: false,
      profileFrame: null
    }
  },
  {
    id: "active",
    name: "Active",
    minPoints: 100,
    emoji: "💪",
    color: "#3b82f6", // Blue
    colorEnd: "#60a5fa",
    description: "Consistently showing up and putting in the work",
    cosmetics: {
      glow: true,
      particles: false,
      animation: null,
      gradientText: false,
      profileFrame: "border-blue-400"
    }
  },
  {
    id: "committed",
    name: "Committed",
    minPoints: 200,
    emoji: "🔥",
    color: "#f59e0b", // Amber
    colorEnd: "#fbbf24",
    description: "Dedicated to the grind, week after week",
    cosmetics: {
      glow: true,
      particles: true,
      animation: "pulse",
      gradientText: true,
      profileFrame: "border-amber-400"
    }
  },
  {
    id: "champion",
    name: "Champion",
    minPoints: 300,
    emoji: "👑",
    color: "#a855f7", // Purple
    colorEnd: "#c084fc",
    description: "Elite performance, crushing your goals",
    cosmetics: {
      glow: true,
      particles: true,
      animation: "bounce",
      gradientText: true,
      profileFrame: "border-purple-400"
    }
  },
  {
    id: "elite",
    name: "Elite",
    minPoints: 500,
    emoji: "⭐",
    color: "#ef4444", // Red
    colorEnd: "#f87171",
    description: "Among the best, relentless dedication",
    cosmetics: {
      glow: true,
      particles: true,
      animation: "float",
      gradientText: true,
      profileFrame: "rainbow-border"
    }
  },
  {
    id: "legend",
    name: "Legend",
    minPoints: 750,
    emoji: "🏆",
    color: "#fbbf24", // Gold
    colorEnd: "#fcd34d",
    description: "Legendary status, unmatched commitment",
    cosmetics: {
      glow: true,
      particles: true,
      animation: "shimmer",
      gradientText: true,
      profileFrame: "rainbow-border-animated"
    }
  }
]

/**
 * Get the current points tier based on weekly points
 */
export function getCurrentPointsTier(weeklyPoints: number): PointsTier {
  // Find the highest tier the user qualifies for
  for (let i = POINTS_TIERS.length - 1; i >= 0; i--) {
    if (weeklyPoints >= POINTS_TIERS[i].minPoints) {
      return POINTS_TIERS[i]
    }
  }
  
  // Return first tier if no qualifications
  return POINTS_TIERS[0]
}

/**
 * Get the next tier to work towards
 */
export function getNextPointsTier(weeklyPoints: number): PointsTier | null {
  const currentTier = getCurrentPointsTier(weeklyPoints)
  const currentIndex = POINTS_TIERS.findIndex(t => t.id === currentTier.id)
  
  if (currentIndex === POINTS_TIERS.length - 1) {
    return null // Already at max tier
  }
  
  return POINTS_TIERS[currentIndex + 1]
}

/**
 * Get points needed to reach next tier
 */
export function getPointsToNextTier(weeklyPoints: number): number {
  const nextTier = getNextPointsTier(weeklyPoints)
  if (!nextTier) return 0
  
  return nextTier.minPoints - weeklyPoints
}

/**
 * Get tier progress as percentage (0-100)
 */
export function getPointsTierProgress(weeklyPoints: number): number {
  const currentTier = getCurrentPointsTier(weeklyPoints)
  const nextTier = getNextPointsTier(weeklyPoints)
  
  if (!nextTier) return 100 // At max tier
  
  const currentTierIndex = POINTS_TIERS.findIndex(t => t.id === currentTier.id)
  const currentMin = currentTierIndex === 0 ? 0 : POINTS_TIERS[currentTierIndex].minPoints
  const nextMin = nextTier.minPoints
  
  const progress = ((weeklyPoints - currentMin) / (nextMin - currentMin)) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * Get tier color based on points
 */
export function getPointsTierColor(weeklyPoints: number): { start: string; end: string } {
  const tier = getCurrentPointsTier(weeklyPoints)
  return { start: tier.color, end: tier.colorEnd }
}
