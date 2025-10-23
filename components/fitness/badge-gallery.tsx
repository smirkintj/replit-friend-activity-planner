"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FitnessBadge, BadgeDefinition } from "@/lib/types"
import { BADGE_DEFINITIONS, getBadgesByCategory } from "@/lib/fitness-badges"
import { Award, Sparkles } from "lucide-react"

interface BadgeGalleryProps {
  unlockedBadges: FitnessBadge[]
  onBadgeClick?: (badge: BadgeDefinition) => void
}

export function BadgeGallery({ unlockedBadges, onBadgeClick }: BadgeGalleryProps) {
  const unlockedSet = new Set(unlockedBadges.map(b => b.badgeType))

  const renderBadge = (badge: BadgeDefinition, unlocked: boolean) => {
    const unlockedBadge = unlockedBadges.find(b => b.badgeType === badge.id)
    
    return (
      <div
        key={badge.id}
        className={`
          relative p-4 rounded-xl text-center transition-all cursor-pointer
          ${unlocked 
            ? "hover:scale-105" 
            : "opacity-40 grayscale hover:opacity-60"
          }
        `}
        style={unlocked ? {
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)'
        } : {
          background: 'rgba(139, 92, 246, 0.05)',
          border: '1px solid rgba(139, 92, 246, 0.15)'
        }}
        onClick={() => onBadgeClick?.(badge)}
      >
        <div className="text-5xl mb-2">{badge.emoji}</div>
        <h4 className="font-semibold text-sm text-white mb-1">{badge.name}</h4>
        <p className="text-xs text-gray-400 line-clamp-2">{badge.description}</p>
        
        {unlocked && unlockedBadge && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
               style={{
                 background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                 boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)'
               }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
        
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <div className="text-4xl">🔒</div>
          </div>
        )}
      </div>
    )
  }

  const categories: Array<{ id: BadgeDefinition['category']; label: string }> = [
    { id: "cardio", label: "🏃 Cardio" },
    { id: "strength", label: "💪 Strength" },
    { id: "streak", label: "🔥 Streaks" },
    { id: "special", label: "⭐ Special" }
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="border-0 text-white"
               style={{
                 background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
               }}>
          {unlockedBadges.length} / {BADGE_DEFINITIONS.length} unlocked
        </Badge>
      </div>

      <Tabs defaultValue="cardio" className="w-full">
          <TabsList className="grid w-full grid-cols-4 backdrop-blur-sm"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="text-gray-400 data-[state=active]:text-white"
                style={{
                  background: 'transparent'
                }}
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(cat => {
            const badges = getBadgesByCategory(cat.id)
            const unlockedCount = badges.filter(b => unlockedSet.has(b.id)).length
            
            return (
              <TabsContent key={cat.id} value={cat.id} className="mt-4">
                <div className="mb-3 text-sm text-gray-400">
                  {unlockedCount} / {badges.length} unlocked
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {badges.map(badge => renderBadge(badge, unlockedSet.has(badge.id)))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
    </div>
  )
}
