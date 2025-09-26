"use server"

import { serverAPIUtils } from "./server-api-utils"
import { getGameScorekeeperAPI, type Competition, type Fixture, type PlayerStats } from "./gamescorekeeper-api"
import type { CS2Match, CS2PlayerStats } from "./cs2-api-client"

const serverCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes server cache

function getCachedData<T>(key: string): T | null {
  const cached = serverCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCachedData<T>(key: string, data: T): void {
  serverCache.set(key, { data, timestamp: Date.now() })
}

function convertFixtureToCS2Match(fixture: Fixture, competition?: Competition): CS2Match {
  const team1 = fixture.participants[0] || { name: "TBD", logo: "/placeholder.svg?height=32&width=32" }
  const team2 = fixture.participants[1] || { name: "TBD", logo: "/placeholder.svg?height=32&width=32" }

  return {
    id: fixture.id.toString(),
    name: `${team1.name} vs ${team2.name}`,
    status: fixture.status === "live" ? "live" : fixture.status === "scheduled" ? "upcoming" : "finished",
    teams: {
      team1: {
        name: team1.name,
        logo: team1.logo || "/placeholder.svg?height=32&width=32",
      },
      team2: {
        name: team2.name,
        logo: team2.logo || "/placeholder.svg?height=32&width=32",
      },
    },
    score: fixture.scores
      ? {
          team1: fixture.scores[0] || 0,
          team2: fixture.scores[1] || 0,
        }
      : undefined,
    format: "BO3", // Default format, could be enhanced with actual data
    startTime: new Date(fixture.scheduledStartTime).toISOString(),
    tournament: competition?.name || "Unknown Tournament",
  }
}

function convertPlayerStatsToCS2(playerStats: PlayerStats, matchId: string): CS2PlayerStats {
  const fantasyPoints = calculateFantasyPoints({
    kills: playerStats.kills,
    deaths: playerStats.deaths,
    assists: playerStats.assists,
    firstKills: 0, // Not available in basic PlayerStats
    clutchesWon: 0,
    multiKills: 0,
    mvpRounds: 0,
    entryFrags: 0,
    firstDeaths: 0,
    clutchesLost: 0,
  })

  return {
    playerId: playerStats.playerId,
    name: playerStats.name,
    team: "Unknown", // Would need additional API call to get team info
    matchId,
    kills: playerStats.kills,
    deaths: playerStats.deaths,
    assists: playerStats.assists,
    adr: playerStats.adr,
    rating: playerStats.rating,
    kast: playerStats.kast,
    headshots: playerStats.headshots,
    firstKills: 0, // Enhanced stats would require additional API calls
    firstDeaths: 0,
    clutchesWon: 0,
    clutchesLost: 0,
    multiKills: 0,
    utilityDamage: playerStats.utilityDamage,
    flashAssists: playerStats.flashAssists,
    mvpRounds: 0,
    entryFrags: 0,
    supportRounds: 0,
    fantasyPoints,
  }
}

function calculateFantasyPoints(stats: {
  kills: number
  deaths: number
  assists: number
  firstKills: number
  clutchesWon: number
  multiKills: number
  mvpRounds: number
  entryFrags: number
  firstDeaths: number
  clutchesLost: number
}): number {
  let points = 0

  // Basic points
  points += stats.kills * 2
  points -= stats.deaths * 1
  points += stats.assists * 1

  // Bonus points
  points += stats.firstKills * 1
  points += stats.clutchesWon * 3
  points += stats.multiKills * 2
  points += stats.mvpRounds * 2
  points += stats.entryFrags * 1

  // Penalties
  points -= stats.firstDeaths * 0.5
  points -= stats.clutchesLost * 1

  return Math.round(points * 10) / 10
}

export async function fetchLiveMatches() {
  try {
    const cached = getCachedData<CS2Match[]>("live-matches")
    if (cached) {
      console.log("[v0] Server action: returning cached CS2 matches")
      return {
        success: true,
        data: cached,
        source: "GameScorekeeper API (cached)",
        error: null,
      }
    }

    console.log("[v0] Server action: fetching CS2 matches from GameScorekeeper")

    try {
      const api = getGameScorekeeperAPI()

      // Get recent competitions
      const competitionsResult = await api.getCompetitions(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      )

      const allMatches: CS2Match[] = []

      // Get fixtures for each competition
      for (const competition of competitionsResult.competitions.slice(0, 5)) {
        // Limit to 5 competitions
        try {
          const fixturesResult = await api.getFixtures(competition.id)
          const matches = fixturesResult.fixtures.map((fixture) => convertFixtureToCS2Match(fixture, competition))
          allMatches.push(...matches)
        } catch (error) {
          console.log(`[v0] Skipping competition ${competition.id} due to error:`, error)
        }
      }

      // Also get live fixtures directly
      try {
        const liveResult = await api.getLiveFixtures()
        const liveMatches = liveResult.fixtures.map((fixture) => convertFixtureToCS2Match(fixture))
        allMatches.push(...liveMatches)
      } catch (error) {
        console.log("[v0] Could not fetch live fixtures:", error)
      }

      // Remove duplicates and sort by start time
      const uniqueMatches = allMatches
        .filter((match, index, self) => index === self.findIndex((m) => m.id === match.id))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

      setCachedData("live-matches", uniqueMatches)

      console.log(`[v0] Server action: fetched ${uniqueMatches.length} CS2 matches from GameScorekeeper`)
      return {
        success: true,
        data: uniqueMatches,
        source: "GameScorekeeper API",
        error: null,
      }
    } catch (apiError) {
      console.log("[v0] GameScorekeeper API error, falling back to mock data:", apiError)
      // Fallback to existing mock data logic
      const { cs2ApiClient } = await import("./cs2-api-client")
      const matches = await cs2ApiClient.getPandaScoreMatches()

      setCachedData("live-matches", matches)

      return {
        success: true,
        data: matches,
        source: "Fallback (Mock Data)",
        error: `GameScorekeeper API temporarily unavailable: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Server action error:", errorMessage)

    return {
      success: true,
      data: [],
      source: "Fallback (API unavailable)",
      error: `API temporarily unavailable: ${errorMessage}`,
    }
  }
}

export async function fetchMatchStats(matchId: string) {
  try {
    const cacheKey = `match-stats-${matchId}`
    const cached = getCachedData<CS2PlayerStats[]>(cacheKey)
    if (cached) {
      console.log("[v0] Server action: returning cached match stats for", matchId)
      return {
        success: true,
        data: cached,
        source: "GameScorekeeper API (cached)",
      }
    }

    console.log("[v0] Server action: fetching detailed stats for match", matchId)

    try {
      const api = getGameScorekeeperAPI()
      const fixtureStats = await api.getFixtureStats(Number.parseInt(matchId))

      const allPlayerStats: CS2PlayerStats[] = []

      // Convert GameScorekeeper stats to CS2PlayerStats format
      for (const map of fixtureStats.maps) {
        if (map.playerStats) {
          const convertedStats = map.playerStats.map((playerStats) => convertPlayerStatsToCS2(playerStats, matchId))
          allPlayerStats.push(...convertedStats)
        }
      }

      setCachedData(cacheKey, allPlayerStats)

      console.log("[v0] Server action: loaded detailed stats for", allPlayerStats.length, "players with fantasy points")
      return {
        success: true,
        data: allPlayerStats,
        source: "GameScorekeeper API",
      }
    } catch (apiError) {
      console.log("[v0] GameScorekeeper API error, falling back to mock data:", apiError)
      // Fallback to existing mock data logic
      const { cs2ApiClient } = await import("./cs2-api-client")
      const detailedStats = await cs2ApiClient.getBO3PlayerStats(matchId)

      setCachedData(cacheKey, detailedStats)

      return {
        success: true,
        data: detailedStats,
        source: "Fallback (Mock Data)",
        error: `GameScorekeeper API temporarily unavailable: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
      }
    }
  } catch (error) {
    console.error("[v0] Server action error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function generateUserApiKey(userId: string) {
  try {
    const apiKey = serverAPIUtils.generateSecureApiKey(userId)
    return { success: true, apiKey }
  } catch (error) {
    console.error("[v0] API key generation error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function fetchPlayers() {
  try {
    const cached = getCachedData<CS2PlayerStats[]>("all-players")
    if (cached) {
      console.log("[v0] Server action: returning cached CS2 players")
      return {
        success: true,
        data: cached,
        source: "GameScorekeeper API (cached)",
        error: null,
      }
    }

    console.log("[v0] Server action: fetching CS2 players from GameScorekeeper")

    try {
      const api = getGameScorekeeperAPI()

      // Get recent matches to extract player data
      const liveResult = await api.getLiveFixtures()
      const allPlayers: CS2PlayerStats[] = []

      // Get player stats from recent matches
      for (const fixture of liveResult.fixtures.slice(0, 5)) {
        // Limit to 5 matches
        try {
          const stats = await api.getFixtureStats(fixture.id)
          for (const map of stats.maps) {
            if (map.playerStats) {
              const convertedStats = map.playerStats.map((playerStats) =>
                convertPlayerStatsToCS2(playerStats, fixture.id.toString()),
              )
              allPlayers.push(...convertedStats)
            }
          }
        } catch (matchError) {
          console.log(`[v0] Skipping match ${fixture.id} due to error:`, matchError)
          continue
        }
      }

      // Remove duplicates by player name
      const uniquePlayers = allPlayers.filter(
        (player, index, self) => index === self.findIndex((p) => p.name === player.name),
      )

      setCachedData("all-players", uniquePlayers)

      console.log(`[v0] Server action: fetched ${uniquePlayers.length} unique CS2 players from GameScorekeeper`)
      return {
        success: true,
        data: uniquePlayers,
        source: "GameScorekeeper API",
        error: null,
      }
    } catch (apiError) {
      console.log("[v0] GameScorekeeper API error, falling back to mock data:", apiError)
      // Fallback to existing mock data logic
      const { cs2ApiClient } = await import("./cs2-api-client")
      const matches = await cs2ApiClient.getPandaScoreMatches()
      const allPlayers = []

      for (const match of matches.slice(0, 3)) {
        try {
          const stats = await cs2ApiClient.getBO3PlayerStats(match.id)
          allPlayers.push(...stats)
        } catch (matchError) {
          console.log(`[v0] Skipping match ${match.id} due to error:`, matchError)
          continue
        }
      }

      const uniquePlayers = allPlayers.filter(
        (player, index, self) => index === self.findIndex((p) => p.name === player.name),
      )

      setCachedData("all-players", uniquePlayers)

      return {
        success: true,
        data: uniquePlayers,
        source: "Fallback (Mock Data)",
        error: `GameScorekeeper API temporarily unavailable: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Server action error:", errorMessage)

    return {
      success: true,
      data: [],
      source: "Fallback (API unavailable)",
      error: `API temporarily unavailable: ${errorMessage}`,
    }
  }
}

export async function refreshMatchData() {
  try {
    serverCache.delete("live-matches")
    serverCache.delete("all-players")

    console.log("[v0] Server action: refreshing CS2 match data from GameScorekeeper")

    try {
      const api = getGameScorekeeperAPI()
      const liveResult = await api.getLiveFixtures()
      const matches = liveResult.fixtures.map((fixture) => convertFixtureToCS2Match(fixture))

      setCachedData("live-matches", matches)

      return {
        success: true,
        data: matches,
        source: "GameScorekeeper API",
        timestamp: new Date().toISOString(),
      }
    } catch (apiError) {
      console.log("[v0] GameScorekeeper API error during refresh:", apiError)
      // Fallback to existing logic
      const { cs2ApiClient } = await import("./cs2-api-client")
      const matches = await cs2ApiClient.getPandaScoreMatches()

      setCachedData("live-matches", matches)

      return {
        success: true,
        data: matches,
        source: "Fallback (Mock Data)",
        timestamp: new Date().toISOString(),
        error: `GameScorekeeper API temporarily unavailable: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
      }
    }
  } catch (error) {
    console.error("[v0] Server action refresh error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
