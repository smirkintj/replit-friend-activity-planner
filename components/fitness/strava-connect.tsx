"use client"

import { useState, useEffect } from "react"
import { Activity, X, CheckCircle2, Loader2 } from "lucide-react"
import { getStravaConnection } from "@/lib/strava-storage"
import type { StravaConnection } from "@/lib/strava-storage"

interface StravaConnectProps {
  friendId: string
  friendName: string
}

export function StravaConnect({ friendId, friendName }: StravaConnectProps) {
  const [connection, setConnection] = useState<StravaConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    loadConnection()
  }, [friendId])

  async function loadConnection() {
    setLoading(true)
    const conn = await getStravaConnection(friendId)
    setConnection(conn)
    setLoading(false)
  }

  function handleConnect() {
    window.location.href = `/api/strava/auth?friend_id=${friendId}`
  }

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect Strava? Your existing workouts will remain.")) {
      return
    }

    setDisconnecting(true)

    try {
      const response = await fetch('/api/strava/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      })

      if (response.ok) {
        setConnection(null)
      } else {
        alert("Failed to disconnect Strava. Please try again.")
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert("An error occurred. Please try again.")
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking Strava connection...</span>
      </div>
    )
  }

  if (connection) {
    return (
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
              <CheckCircle2 className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Strava Connected</p>
              <p className="text-xs text-muted-foreground">
                Workouts sync automatically
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            {disconnecting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Disconnecting...</span>
              </>
            ) : (
              <>
                <X className="h-3 w-3" />
                <span>Disconnect</span>
              </>
            )}
          </button>
        </div>
        {connection.last_sync_at && (
          <p className="text-xs text-muted-foreground mt-2">
            Last synced: {new Date(connection.last_sync_at).toLocaleString()}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="glass-card p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
            <Activity className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Connect Strava</p>
            <p className="text-xs text-muted-foreground">
              Auto-sync your workouts
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
        >
          Connect
        </button>
      </div>
    </div>
  )
}
