"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CollapsibleSectionProps {
  title: string
  icon?: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
  className = "",
  style
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={`backdrop-blur-lg border overflow-hidden ${className}`} style={style}>
      <CardHeader
        className="cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </CardHeader>
      {isOpen && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  )
}
