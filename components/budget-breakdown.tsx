"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import type { BudgetItem } from "@/lib/types"

interface BudgetBreakdownProps {
  breakdown: BudgetItem[]
  onChange: (breakdown: BudgetItem[]) => void
}

const BUDGET_CATEGORIES = [
  "Flight",
  "Accommodation",
  "Food",
  "Transportation",
  "Activities",
  "Shopping",
  "Insurance",
  "Visa",
  "Miscellaneous",
]

export function BudgetBreakdown({ breakdown, onChange }: BudgetBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: "Miscellaneous",
      amount: 0,
    }
    onChange([...breakdown, newItem])
  }

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    onChange(breakdown.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeItem = (id: string) => {
    onChange(breakdown.filter((item) => item.id !== id))
  }

  const totalBreakdown = breakdown.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Budget (MYR)</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide Breakdown
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Add Breakdown
            </>
          )}
        </Button>
      </div>

      {!isExpanded && (
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 5000.00"
          value={totalBreakdown || ""}
          onChange={(e) => {
            const total = Number.parseFloat(e.target.value) || 0
            if (breakdown.length === 0) {
              onChange([
                {
                  id: Date.now().toString(),
                  category: "Miscellaneous",
                  amount: total,
                },
              ])
            }
          }}
        />
      )}

      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.id} className="flex gap-2">
                <Select value={item.category} onValueChange={(value) => updateItem(item.id, "category", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RM</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={item.amount === 0 ? "" : item.amount}
                    onChange={(e) => {
                      const value = e.target.value
                      updateItem(item.id, "amount", value === "" ? 0 : Number.parseFloat(value))
                    }}
                    className="pl-12"
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-lg">RM {totalBreakdown.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
