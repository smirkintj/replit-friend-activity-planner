"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
            ? "badge-gold glow-primary hover-lift" 
            : "opacity-40 grayscale hover:opacity-60 glass-card"
          }
        `}
        onClick={() => onBadgeClick?.(badge)}
      >
        <div className="text-5xl mb-2">{badge.emoji}</div>
        <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
        
        {unlocked && unlockedBadge && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
        
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Badge Collection
          <Badge variant="secondary" className="ml-auto">
            {unlockedBadges.length} / {BADGE_DEFINITIONS.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cardio" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(cat => {
            const badges = getBadgesByCategory(cat.id)
            const unlockedCount = badges.filter(b => unlockedSet.has(b.id)).length
            
            return (
              <TabsContent key={cat.id} value={cat.id} className="mt-4">
                <div className="mb-3 text-sm text-muted-foreground">
                  {unlockedCount} / {badges.length} unlocked
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {badges.map(badge => renderBadge(badge, unlockedSet.has(badge.id)))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
