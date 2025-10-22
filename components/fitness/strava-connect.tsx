"use client"

import { useState, useEffect } from "react"
import { Activity, X, CheckCircle2, Loader2 } from "lucide-react"
import type { StravaConnectionStatus } from "@/lib/strava-storage"

interface StravaConnectProps {
  friendId: string
  friendName: string
}

export function StravaConnect({ friendId, friendName }: StravaConnectProps) {
  const [status, setStatus] = useState<StravaConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [friendId])

  async function loadStatus() {
    setLoading(true)
    try {
      const response = await fetch(`/api/strava/status?friend_id=${friendId}`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error loading Strava status:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleConnect() {
    const authUrl = `/api/strava/auth?friend_id=${friendId}`;
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      'Strava Authorization',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      alert("Please allow popups for this site to connect to Strava.");
      return;
    }
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setTimeout(() => loadStatus(), 500);
      }
    }, 500);
    
    setTimeout(() => clearInterval(checkClosed), 10 * 60 * 1000);
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
        setStatus({ isConnected: false })
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
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking Strava connection...</span>
      </div>
    )
  }

  if (status?.isConnected) {
    return (
      <div className="p-4 rounded-lg backdrop-blur-lg border"
           style={{
             background: 'rgba(15, 20, 45, 0.6)',
             borderColor: 'rgba(139, 92, 246, 0.3)',
             boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
           }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full"
                 style={{
                   background: 'rgba(251, 146, 60, 0.15)',
                   border: '2px solid rgba(251, 146, 60, 0.3)'
                 }}>
              <CheckCircle2 className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">Strava Connected</p>
              <p className="text-xs text-gray-400">
                Workouts sync automatically
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50 text-red-400 border border-red-500/30 hover:bg-red-500/10"
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
        {status.lastSyncAt && (
          <p className="text-xs text-gray-500 mt-2">
            Last synced: {new Date(status.lastSyncAt).toLocaleString()}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg backdrop-blur-lg border"
         style={{
           background: 'rgba(15, 20, 45, 0.6)',
           borderColor: 'rgba(139, 92, 246, 0.3)',
           boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
         }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full"
               style={{
                 background: 'rgba(251, 146, 60, 0.15)',
                 border: '2px solid rgba(251, 146, 60, 0.3)'
               }}>
            <Activity className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="font-medium text-sm text-white">Connect Strava</p>
            <p className="text-xs text-gray-400">
              Auto-sync your workouts
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="px-4 py-2 text-sm rounded-lg font-medium text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            boxShadow: '0 0 20px rgba(251, 146, 60, 0.4)'
          }}
        >
          Connect
        </button>
      </div>
    </div>
  )
}
