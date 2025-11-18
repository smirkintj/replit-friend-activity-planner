"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationSuggestion {
  name: string
  displayName: string
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: {
    address: string
    lat: number | null
    lng: number | null
  }
  onChange: (location: { address: string; lat: number | null; lng: number | null }) => void
  placeholder?: string
}

export function LocationPicker({ value, onChange, placeholder = "Search location..." }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value.address || "")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`
        )
        const data = await response.json()

        const results: LocationSuggestion[] = data.features.map((feature: any) => {
          const props = feature.properties
          const name = props.name || props.street || ""
          const city = props.city || props.state || ""
          const country = props.country || ""

          return {
            name,
            displayName: [name, city, country].filter(Boolean).join(", "),
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
          }
        })

        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error("Failed to fetch location suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }, [searchQuery])

  const selectLocation = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.displayName)
    onChange({
      address: suggestion.displayName,
      lat: suggestion.lat,
      lng: suggestion.lng,
    })
    setSuggestions([])
    setShowSuggestions(false)
  }

  const clearLocation = () => {
    setSearchQuery("")
    onChange({ address: "", lat: null, lng: null })
    setSuggestions([])
  }

  const googleMapsUrl = value.lat && value.lng 
    ? `https://www.google.com/maps/search/?api=1&query=${value.lat},${value.lng}`
    : null

  const appleMapsUrl = value.lat && value.lng
    ? `https://maps.apple.com/?q=${value.lat},${value.lng}`
    : null

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!e.target.value) {
                  clearLocation()
                }
              }}
              placeholder={placeholder}
              className="pr-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {searchQuery && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={clearLocation}
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-accent flex items-start gap-2 text-sm"
                onClick={() => selectLocation(suggestion)}
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{suggestion.displayName}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {value.lat && value.lng && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            📍 {value.lat.toFixed(4)}°, {value.lng.toFixed(4)}°
          </div>
          
          <div className="flex gap-2">
            {googleMapsUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(googleMapsUrl, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Google Maps
              </Button>
            )}
            {appleMapsUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(appleMapsUrl, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Apple Maps
              </Button>
            )}
          </div>

          {googleMapsUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+8b5cf6(${value.lng},${value.lat})/${value.lng},${value.lat},14,0/400x200@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                alt="Location preview"
                className="w-full h-40 object-cover"
                onError={(e) => {
                  // Fallback to simple div if image fails to load
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
