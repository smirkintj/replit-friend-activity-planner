"use client"

import { WeeklyChallenge } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

interface WeeklyChallengesProps {
  challenges: WeeklyChallenge[]
}

export function WeeklyChallenges({ challenges }: WeeklyChallengesProps) {
  return (
    <Card className="backdrop-blur-lg border overflow-hidden"
          style={{
            background: 'rgba(15, 20, 45, 0.6)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
          }}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="text-3xl">🎯</div>
          <div>
            <h3 className="text-xl font-bold text-white">WEEKLY CHALLENGES</h3>
            <p className="text-xs text-gray-400">Reset every Monday • Earn bonus rewards</p>
          </div>
        </div>

        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 rounded-xl backdrop-blur-sm transition-all duration-200"
              style={{
                background: challenge.completed 
                  ? 'rgba(34, 197, 94, 0.15)' 
                  : 'rgba(139, 92, 246, 0.1)',
                border: challenge.completed
                  ? '1px solid rgba(34, 197, 94, 0.4)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: challenge.completed
                  ? '0 0 15px rgba(34, 197, 94, 0.2)'
                  : 'none'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{challenge.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">
                        {challenge.title}
                      </h4>
                      {challenge.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden"
                           style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${challenge.progress}%`,
                            background: challenge.completed
                              ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                              : 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
                            boxShadow: challenge.completed
                              ? '0 0 10px rgba(34, 197, 94, 0.5)'
                              : '0 0 10px rgba(139, 92, 246, 0.5)'
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-white min-w-[60px] text-right">
                        {challenge.current}/{challenge.target} {challenge.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium"
                            style={{
                              color: challenge.completed ? '#22c55e' : '#8b5cf6'
                            }}>
                        {challenge.completed ? '✅ Completed!' : `${challenge.progress}% done`}
                      </span>
                      <span className="text-xs text-gray-400">
                        Reward: {challenge.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg"
             style={{
               background: 'rgba(251, 191, 36, 0.1)',
               border: '1px solid rgba(251, 191, 36, 0.2)'
             }}>
          <p className="text-xs text-center text-yellow-300">
            💡 Complete challenges to earn bonus points and special badges!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
