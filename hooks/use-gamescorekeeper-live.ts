"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { fetchLiveMatches, fetchMatchStats } from "@/lib/server-actions"
import type { CS2Match, CS2PlayerStats } from "@/lib/cs2-api-client"

interface LiveMatchState {
  match: CS2Match
  playerStats?: CS2PlayerStats[]
  lastUpdated: number
}

interface UseGameScorekeeperLiveOptions {
  matchId: string | null
  pollingInterval?: number
  autoRefresh?: boolean
}

export function useGameScorekeeperLive({
  matchId,
  pollingInterval = 30000, // 30 seconds
  autoRefresh = true,
}: UseGameScorekeeperLiveOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const [liveData, setLiveData] = useState<LiveMatchState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  const fetchLiveData = useCallback(async () => {
    if (!matchId) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      // Fetch live matches to get current match state
      const matchesResult = await fetchLiveMatches()
      if (!matchesResult.success) {
        throw new Error(matchesResult.error || "Failed to fetch live matches")
      }

      const currentMatch = matchesResult.data.find((match) => match.id === matchId)
      if (!currentMatch) {
        throw new Error("Match not found")
      }

      // Fetch detailed stats if match is live
      let playerStats: CS2PlayerStats[] | undefined
      if (currentMatch.status === "live") {
        const statsResult = await fetchMatchStats(matchId)
        if (statsResult.success) {
          playerStats = statsResult.data
        }
      }

      const newLiveData: LiveMatchState = {
        match: currentMatch,
        playerStats,
        lastUpdated: Date.now(),
      }

      setLiveData(newLiveData)
      setLastUpdated(Date.now())

      console.log(`[v0] Updated live data for match ${matchId}`)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return // Request was cancelled
      }
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      console.error(`[v0] Error fetching live data for match ${matchId}:`, err)
    } finally {
      setLoading(false)
    }
  }, [matchId])

  const startPolling = useCallback(() => {
    if (!autoRefresh || !matchId) return

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Start polling
    intervalRef.current = setInterval(fetchLiveData, pollingInterval)
    console.log(`[v0] Started polling for match ${matchId} every ${pollingInterval}ms`)
  }, [fetchLiveData, pollingInterval, autoRefresh, matchId])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log(`[v0] Stopped polling for match ${matchId}`)
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [matchId])

  const refresh = useCallback(() => {
    fetchLiveData()
  }, [fetchLiveData])

  useEffect(() => {
    if (matchId) {
      // Initial fetch
      fetchLiveData()

      // Start polling if auto-refresh is enabled
      if (autoRefresh) {
        startPolling()
      }
    } else {
      setLiveData(null)
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [matchId, fetchLiveData, startPolling, stopPolling, autoRefresh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    liveData,
    loading,
    error,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling,
  }
}

export function useMultipleGameScorekeeperLive(matchIds: string[]) {
  const [liveDataMap, setLiveDataMap] = useState<Map<string, LiveMatchState>>(new Map())
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Map<string, string>>(new Map())
  const [lastUpdated, setLastUpdated] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAllLiveData = useCallback(async () => {
    if (matchIds.length === 0) return

    setLoading(true)
    const newLiveDataMap = new Map<string, LiveMatchState>()
    const newErrorsMap = new Map<string, string>()

    try {
      // Fetch all live matches at once
      const matchesResult = await fetchLiveMatches()
      if (!matchesResult.success) {
        throw new Error(matchesResult.error || "Failed to fetch live matches")
      }

      // Process each requested match
      for (const matchId of matchIds) {
        try {
          const currentMatch = matchesResult.data.find((match) => match.id === matchId)
          if (!currentMatch) {
            newErrorsMap.set(matchId, "Match not found")
            continue
          }

          // Fetch detailed stats if match is live
          let playerStats: CS2PlayerStats[] | undefined
          if (currentMatch.status === "live") {
            const statsResult = await fetchMatchStats(matchId)
            if (statsResult.success) {
              playerStats = statsResult.data
            }
          }

          newLiveDataMap.set(matchId, {
            match: currentMatch,
            playerStats,
            lastUpdated: Date.now(),
          })
        } catch (matchError) {
          const errorMessage = matchError instanceof Error ? matchError.message : "Unknown error"
          newErrorsMap.set(matchId, errorMessage)
        }
      }

      setLiveDataMap(newLiveDataMap)
      setErrors(newErrorsMap)
      setLastUpdated(Date.now())

      console.log(`[v0] Updated live data for ${newLiveDataMap.size} matches`)
    } catch (error) {
      console.error("[v0] Error fetching multiple live data:", error)
      // Set error for all matches
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const allErrorsMap = new Map<string, string>()
      matchIds.forEach((id) => allErrorsMap.set(id, errorMessage))
      setErrors(allErrorsMap)
    } finally {
      setLoading(false)
    }
  }, [matchIds])

  const startPolling = useCallback(() => {
    if (matchIds.length === 0) return

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Start polling every 45 seconds (longer for multiple matches)
    intervalRef.current = setInterval(fetchAllLiveData, 45000)
    console.log(`[v0] Started polling for ${matchIds.length} matches`)
  }, [fetchAllLiveData, matchIds.length])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log(`[v0] Stopped polling for multiple matches`)
    }
  }, [])

  useEffect(() => {
    if (matchIds.length > 0) {
      // Initial fetch
      fetchAllLiveData()
      // Start polling
      startPolling()
    } else {
      setLiveDataMap(new Map())
      setErrors(new Map())
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [matchIds, fetchAllLiveData, startPolling, stopPolling])

  return {
    liveDataMap,
    loading,
    errors,
    lastUpdated,
    refresh: fetchAllLiveData,
    totalMatches: matchIds.length,
    activeMatches: liveDataMap.size,
  }
}
