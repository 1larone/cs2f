"use client"

import { useState, useEffect, useRef } from "react"
import type { CS2Match, CS2PlayerStats } from "@/lib/cs2-api-client"
import { fetchLiveMatches, fetchPlayers, fetchMatchStats } from "@/lib/server-actions"

const globalPlayerCache = new Map<string, { data: CS2PlayerStats; timestamp: number }>()
const allPlayersCache = { data: null, timestamp: 0 }
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

let fetchPlayersPromise: Promise<CS2PlayerStats[]> | null = null

async function getAllPlayers(): Promise<CS2PlayerStats[]> {
  if (allPlayersCache.data && Date.now() - allPlayersCache.timestamp < CACHE_DURATION) {
    return allPlayersCache.data
  }

  if (fetchPlayersPromise) {
    return fetchPlayersPromise
  }

  fetchPlayersPromise = (async () => {
    try {
      const result = await fetchPlayers()
      if (!result.success) throw new Error(result.error || "Failed to fetch players")

      allPlayersCache.data = result.data
      allPlayersCache.timestamp = Date.now()

      result.data.forEach((player) => {
        globalPlayerCache.set(player.playerId, { data: player, timestamp: Date.now() })
      })

      return result.data
    } finally {
      fetchPlayersPromise = null
    }
  })()

  return fetchPlayersPromise
}

export function useHLTVPlayer(playerId: string | null) {
  const [player, setPlayer] = useState<CS2PlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!playerId) {
      setPlayer(null)
      return
    }

    const cached = globalPlayerCache.get(playerId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPlayer(cached.data)
      return
    }

    const fetchPlayer = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError(null)

      try {
        const allPlayers = await getAllPlayers()

        const foundPlayer = allPlayers.find((p) => p.playerId === playerId)
        if (!foundPlayer) throw new Error("Player not found")

        setPlayer(foundPlayer)
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return // Request was cancelled
        }
        setError(err instanceof Error ? err.message : "Unknown error")
        console.log(`[v0] Error fetching player ${playerId}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [playerId])

  return { player, loading, error }
}

export function useAllPlayers() {
  const [players, setPlayers] = useState<CS2PlayerStats[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllPlayers = async () => {
      setLoading(true)
      setError(null)

      try {
        const allPlayers = await getAllPlayers()
        setPlayers(allPlayers)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.log("[v0] Error fetching all players:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllPlayers()
  }, [])

  return { players, loading, error }
}

export function useLiveMatches() {
  const [matches, setMatches] = useState<CS2Match[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchLiveMatches()
        if (!result.success) throw new Error(result.error || "Failed to fetch matches")

        setMatches(result.data)
        setSource(result.source || "unknown")
        console.log(`[v0] Loaded ${result.data.length} CS2 matches from ${result.source}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()

    intervalRef.current = setInterval(fetchMatches, 2 * 60 * 1000) // 2 minutes instead of 1

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { matches, loading, error, source }
}

export function useMatchStats(matchId: string | null) {
  const [stats, setStats] = useState<CS2PlayerStats[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) return

    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchMatchStats(matchId)
        if (!result.success) throw new Error(result.error || "Failed to fetch match stats")

        setStats(result.data)
        console.log(`[v0] Loaded detailed stats for ${result.data.length} players with fantasy points`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [matchId])

  return { stats, loading, error }
}
