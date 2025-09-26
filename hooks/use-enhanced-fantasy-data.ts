"use client"

import { useState, useEffect } from "react"
import { gridAPIClient, type PlayerFantasyStats } from "@/lib/grid-api-client"
import { convertToFantasyPerformance } from "@/lib/match-api"
import { calculateDailyFantasyResults, type FantasyTeam, type MatchPerformance } from "@/lib/fantasy-scoring"
import { fetchLiveMatches, fetchMatchStats } from "@/lib/server-actions"

interface EnhancedFantasyData {
  liveMatches: any[]
  todayPerformances: MatchPerformance[]
  playerFantasyStats: PlayerFantasyStats[]
  playerAverages: Map<string, PlayerFantasyStats>
  recentSeries: any[]
  loading: boolean
  error: string | null
}

export function useEnhancedFantasyData(): EnhancedFantasyData & {
  calculateFantasyResults: (userTeams: FantasyTeam[]) => any
  refreshData: () => Promise<void>
} {
  const [liveMatches, setLiveMatches] = useState([])
  const [todayPerformances, setTodayPerformances] = useState<MatchPerformance[]>([])
  const [playerFantasyStats, setPlayerFantasyStats] = useState<PlayerFantasyStats[]>([])
  const [playerAverages, setPlayerAverages] = useState<Map<string, PlayerFantasyStats>>(new Map())
  const [recentSeries, setRecentSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching enhanced fantasy data...")

      // Fetch live matches
      const matchesResult = await fetchLiveMatches()
      if (!matchesResult.success) {
        throw new Error(matchesResult.error)
      }
      setLiveMatches(matchesResult.data)

      // Fetch fantasy player stats via GraphQL
      const fantasyStatsResult = await gridAPIClient.getFantasyPlayerStats(5)
      if (fantasyStatsResult.success) {
        setPlayerFantasyStats(fantasyStatsResult.data)
        console.log(`[v0] Loaded ${fantasyStatsResult.data.length} fantasy player performances`)
      }

      // Fetch player averages
      const averagesResult = await gridAPIClient.getPlayerAverages()
      if (averagesResult.success) {
        setPlayerAverages(averagesResult.data)
        console.log(`[v0] Loaded averages for ${averagesResult.data.size} players`)
      }

      // Fetch recent series
      const seriesResult = await gridAPIClient.getRecentSeries(10)
      if (seriesResult.success) {
        setRecentSeries(seriesResult.data)
        console.log(`[v0] Loaded ${seriesResult.data.length} recent series`)
      }

      // Get performance data for finished matches
      const performances: MatchPerformance[] = []
      for (const match of matchesResult.data) {
        if (match.status === "finished" || match.status === "live") {
          const statsResult = await fetchMatchStats(match.id)
          if (statsResult.success) {
            const stats = statsResult.data
            const totalRounds = 30

            stats.forEach((stat) => {
              performances.push(
                convertToFantasyPerformance(
                  {
                    matchId: stat.matchId || match.id,
                    playerId: stat.playerId,
                    kills: stat.kills,
                    deaths: stat.deaths,
                    assists: stat.assists,
                    adr: stat.adr,
                    rating: stat.rating,
                    kast: stat.kast,
                    headshots: stat.headshots,
                    firstKills: stat.firstKills,
                    firstDeaths: stat.firstDeaths,
                    clutchesWon: stat.clutchesWon || 0,
                    clutchesLost: stat.clutchesLost || 0,
                    multiKills: stat.multiKills || 0,
                    utilityDamage: stat.utilityDamage || 0,
                    flashAssists: stat.flashAssists || 0,
                    mvpRounds: stat.mvpRounds || 0,
                  },
                  totalRounds,
                ),
              )
            })
          }
        }
      }
      setTodayPerformances(performances)

      console.log("[v0] Enhanced fantasy data loaded successfully")
    } catch (err) {
      console.error("[v0] Enhanced fantasy data fetch error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 60 seconds (less frequent due to more comprehensive data)
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const calculateFantasyResults = (userTeams: FantasyTeam[]) => {
    const matchResults = liveMatches.map((match) => ({
      matchId: match.id,
      team1Won: match.team1?.score > match.team2?.score,
    }))

    return calculateDailyFantasyResults(userTeams, todayPerformances, matchResults)
  }

  return {
    liveMatches,
    todayPerformances,
    playerFantasyStats,
    playerAverages,
    recentSeries,
    loading,
    error,
    calculateFantasyResults,
    refreshData: fetchData,
  }
}
