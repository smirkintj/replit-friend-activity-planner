"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { STREAK_TIERS, getCurrentStreakTier, getNextStreakTier } from "@/lib/streak-tiers"
import { CheckCircle, Lock } from "lucide-react"

interface StreakTierExplainerProps {
  currentStreakDays: number
}

export function StreakTierExplainer({ currentStreakDays }: StreakTierExplainerProps) {
  const currentTier = getCurrentStreakTier(currentStreakDays)
  const nextTier = getNextStreakTier(currentStreakDays)

  return (
    <Card className="backdrop-blur-lg border overflow-hidden"
          style={{
            background: 'rgba(15, 20, 45, 0.6)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
          }}>
      <CardHeader>
        <CardTitle className="text-white">🏆 STREAK TIER REWARDS</CardTitle>
        <p className="text-sm text-gray-400 mt-2">
          Keep your streak alive to unlock cosmetic rewards! Your name will glow throughout the entire app.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {STREAK_TIERS.map((tier, index) => {
          const isUnlocked = currentStreakDays >= tier.days
          const isNext = nextTier?.name === tier.name
          const isCurrent = currentTier.name === tier.name

          return (
            <div
              key={tier.name}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrent ? 'scale-105' : ''
              }`}
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${tier.color}15 0%, ${tier.color}08 100%)`
                  : 'rgba(107, 114, 128, 0.1)',
                borderColor: isCurrent
                  ? tier.color
                  : isUnlocked
                  ? `${tier.color}80`
                  : 'rgba(107, 114, 128, 0.3)',
                boxShadow: isCurrent
                  ? `0 0 20px ${tier.color}50`
                  : 'none'
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon & Status */}
                <div className="flex-shrink-0">
                  <div
                    className="text-4xl mb-2 transition-transform hover:scale-110"
                    style={{ filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}
                  >
                    {tier.emoji}
                  </div>
                  {isUnlocked ? (
                    <CheckCircle className="h-5 w-5 mx-auto" style={{ color: tier.color }} />
                  ) : (
                    <Lock className="h-5 w-5 mx-auto text-gray-500" />
                  )}
                </div>

                {/* Tier Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                            style={{ background: tier.color }}>
                        CURRENT
                      </span>
                    )}
                    {isNext && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500 text-white">
                        NEXT
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mb-2">{tier.description}</p>

                  <div className="text-xs text-gray-400 mb-3">
                    <span className="font-mono font-bold" style={{ color: tier.color }}>
                      {tier.days} days
                    </span>{' '}
                    streak required
                  </div>

                  {/* Cosmetic Benefits */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                      Cosmetic Rewards:
                    </div>
                    <ul className="text-sm space-y-1.5">
                      {tier.nameTag && (
                        <li className="flex items-center gap-2">
                          <span className="text-lg">{tier.nameTag.icon}</span>
                          <span className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                            <span style={{ color: isUnlocked ? tier.nameTag.color : undefined }}>
                              "{tier.nameTag.label}"
                            </span>{' '}
                            badge next to your name
                          </span>
                        </li>
                      )}

                      {tier.nameEffect.type !== 'none' && (
                        <li className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                          ✨ {tier.nameEffect.type === 'gradient' && 'Gradient name effect'}
                          {tier.nameEffect.type === 'animated-gradient' && 'Animated gradient name'}
                          {tier.nameEffect.type === 'prism' && 'Prism shimmer name effect'}
                          {tier.nameEffect.type === 'thunderstorm' && 'Thunderstorm animated name'}
                        </li>
                      )}

                      {tier.profileFrame && tier.profileFrame.type !== 'none' && (
                        <li className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                          🖼️ {tier.profileFrame.type === 'basic' && 'Colored profile frame'}
                          {tier.profileFrame.type === 'holographic' && 'Holographic profile frame'}
                          {tier.profileFrame.type === 'royal' && 'Royal double-border frame'}
                          {tier.profileFrame.type === 'cosmic' && 'Cosmic animated frame'}
                          {tier.profileFrame.glow && ' with glow effect'}
                        </li>
                      )}

                      {tier.particles && tier.particles !== 'none' && (
                        <li className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                          💫 {tier.particles === 'sparks' && 'Spark particles'}
                          {tier.particles === 'crystals' && 'Floating crystal particles'}
                          {tier.particles === 'crowns' && 'Orbiting crown sprites'}
                          {tier.particles === 'cosmic' && 'Cosmic lightning particles'}
                        </li>
                      )}

                      {tier.hoverEffect && tier.hoverEffect !== 'none' && (
                        <li className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                          🎆 {tier.hoverEffect === 'confetti' && 'Confetti burst on hover'}
                          {tier.hoverEffect === 'sparkles' && 'Sparkle effect on hover'}
                          {tier.hoverEffect === 'lightning' && 'Lightning strike on hover'}
                          {tier.hoverEffect === 'fireworks' && 'Fireworks on hover'}
                        </li>
                      )}

                      {tier.specialEffect && (
                        <li className={isUnlocked ? 'text-gray-200' : 'text-gray-500'}>
                          🌟 {tier.specialEffect}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Progress bar for next tier */}
              {isNext && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Your streak: {currentStreakDays} days</span>
                    <span>{tier.days - currentStreakDays} days to go!</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(currentStreakDays / tier.days) * 100}%`,
                        background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Perpetual Streak Info */}
        <div className="mt-6 p-4 rounded-lg"
             style={{
               background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
               border: '2px solid rgba(16, 185, 129, 0.4)'
             }}>
          <div className="text-center">
            <div className="text-3xl mb-2">♾️</div>
            <h4 className="text-lg font-bold text-white mb-1">PERPETUAL STREAK</h4>
            <p className="text-sm text-gray-300">
              Your streak has NO CAP! Keep going to reach 200, 365, 500+ days!
              Once you unlock Godlike tier, your cosmetics persist forever. 🔥
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
