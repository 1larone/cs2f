"use client"

import { useState, useEffect } from "react"

interface HLTVPlayerStats {
  nickname: string
  realName: string
  rating: string
  kd: string
  adr: string
  hltvUrl: string
  error?: string
}

export function useHLTVPlayerStats(playerId?: string) {
  const [stats, setStats] = useState<HLTVPlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playerId) return

    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/player/${playerId}/hltv`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        }

        setStats(data)
      } catch (err) {
        setError("Failed to fetch HLTV stats")
        console.error("Error fetching HLTV stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [playerId])

  return { stats, loading, error }
}
