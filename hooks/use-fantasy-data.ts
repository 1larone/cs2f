"use client"

import { useState, useEffect } from "react"
import { convertToFantasyPerformance } from "@/lib/match-api"
import { calculateDailyFantasyResults, type FantasyTeam, type MatchPerformance } from "@/lib/fantasy-scoring"
import { fetchLiveMatches, fetchMatchStats } from "@/lib/server-actions"

export function useFantasyData() {
  const [liveMatches, setLiveMatches] = useState([])
  const [todayPerformances, setTodayPerformances] = useState<MatchPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const matchesResult = await fetchLiveMatches()
        if (!matchesResult.success) {
          throw new Error(matchesResult.error)
        }

        const matches = matchesResult.data
        setLiveMatches(matches)

        // Get performance data for all finished matches today
        const performances: MatchPerformance[] = []

        for (const match of matches) {
          if (match.status === "finished" || match.status === "live") {
            const statsResult = await fetchMatchStats(match.id)
            if (statsResult.success) {
              const stats = statsResult.data
              const totalRounds = 30 // Default rounds for CS2 match

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
      } catch (err) {
        console.error("[v0] Fantasy data fetch error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every 30 seconds for live matches
    const interval = setInterval(fetchData, 30000)
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
    loading,
    error,
    calculateFantasyResults,
  }
}
