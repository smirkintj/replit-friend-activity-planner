"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2, X, Check } from "lucide-react"
import { saveGroup, deleteGroup } from "@/lib/storage"
import type { AppData, Group } from "@/lib/types"
import { Label } from "@/components/ui/label"

interface GroupsManagerProps {
  data: AppData
  onUpdate: () => void
}

const PRESET_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#f43f5e"]

export function GroupsManager({ data, onUpdate }: GroupsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", color: PRESET_COLORS[0] })

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    await saveGroup({
      name: formData.name,
      color: formData.color,
    })

    setFormData({ name: "", color: PRESET_COLORS[0] })
    setIsAdding(false)
    onUpdate()
  }

  const handleEdit = (group: Group) => {
    setEditingId(group.id)
    setFormData({ name: group.name, color: group.color })
  }

  const handleUpdate = async () => {
    if (!formData.name.trim() || !editingId) return

    await saveGroup({
      id: editingId,
      name: formData.name,
      color: formData.color,
    })

    setFormData({ name: "", color: PRESET_COLORS[0] })
    setEditingId(null)
    onUpdate()
  }

  const handleDelete = async (id: string) => {
    await deleteGroup(id)
    onUpdate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Groups</h2>
          <p className="text-sm text-muted-foreground">Organize friends into groups</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Group" : "Add New Group"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., College Friends, Work Team"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className="h-10 w-10 rounded-md border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: formData.color === color ? "#000" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingId ? handleUpdate : handleAdd}>
                <Check className="h-4 w-4 mr-2" />
                {editingId ? "Update" : "Add"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setEditingId(null)
                  setFormData({ name: "", color: PRESET_COLORS[0] })
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.groups.map((group) => {
          const friendCount = data.friends.filter((f) => f.groupIds.includes(group.id)).length
          return (
            <Card key={group.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: group.color }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{group.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {friendCount} {friendCount === 1 ? "friend" : "friends"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(group)} className="flex-1">
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(group.id)} className="flex-1">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {data.groups.length === 0 && !isAdding && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No groups created yet. Click "Add Group" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
