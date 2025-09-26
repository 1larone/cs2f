// GameScorekeeper API integration for CS2 data
// Replaces problematic HLTV/PandaScore APIs with specialized esports data

interface GameScorekeeperConfig {
  baseUrl: string
  token: string
}

interface Competition {
  id: number
  name: string
  sportAlias: string
  startDate: number
  endDate: number
  prizePoolUSD?: number
  location?: string
  organizer?: string
  type: string
  metadata?: {
    liquipediaTier?: string
  }
}

interface Participant {
  id: number
  name: string
  shortName?: string
  country?: string
  logo?: string
}

interface Fixture {
  id: number
  competitionId: number
  scheduledStartTime: number
  actualStartTime?: number
  status: "scheduled" | "live" | "finished" | "cancelled"
  participants: Participant[]
  scores?: number[]
  maps?: string[]
}

interface PlayerStats {
  playerId: string
  name: string
  kills: number
  deaths: number
  assists: number
  adr: number
  kast: number
  rating: number
  headshots: number
  flashAssists: number
  utilityDamage: number
}

interface FixtureStats {
  maps: Array<{
    mapNumber: number
    mapName: string
    roundHistory: Array<{
      roundNumber: number
      winnerId: number
      winSide: "Terrorist" | "CT" | "Unknown"
      winCondition: "elimination" | "bomb_exploded" | "bomb_defused" | "round_time_expired" | "unknown"
    }>
    playerStats?: PlayerStats[]
  }>
}

class GameScorekeeperAPI {
  private config: GameScorekeeperConfig
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 2 * 60 * 1000 // 2 minutes

  constructor(config: GameScorekeeperConfig) {
    this.config = config
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    const url = new URL(endpoint, this.config.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`GameScorekeeper API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Cache the result
    this.cache.set(cacheKey, { data, timestamp: Date.now() })

    return data
  }

  // Get CS2 competitions within date range
  async getCompetitions(from?: Date, to?: Date): Promise<{ competitions: Competition[] }> {
    const params: Record<string, string> = {
      sport: "cs2",
    }

    if (from) params.from = from.toISOString().split("T")[0]
    if (to) params.to = to.toISOString().split("T")[0]

    return this.request<{ competitions: Competition[] }>("/v1/competitions", params)
  }

  // Get fixtures for a specific competition
  async getFixtures(competitionId: number): Promise<{ fixtures: Fixture[] }> {
    return this.request<{ fixtures: Fixture[] }>(`/v1/competitions/${competitionId}/fixtures`)
  }

  // Get live fixtures
  async getLiveFixtures(): Promise<{ fixtures: Fixture[] }> {
    return this.request<{ fixtures: Fixture[] }>("/v1/fixtures", { status: "live", sport: "cs2" })
  }

  // Get detailed stats for a fixture
  async getFixtureStats(fixtureId: number): Promise<FixtureStats> {
    return this.request<FixtureStats>(`/v1/fixtures/${fixtureId}/stats`)
  }

  // Get participants (teams/players)
  async getParticipants(): Promise<{ participants: Participant[] }> {
    return this.request<{ participants: Participant[] }>("/v1/participants", { sport: "cs2" })
  }

  // Live data should be fetched through server actions with polling

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance
let apiInstance: GameScorekeeperAPI | null = null

export function getGameScorekeeperAPI(): GameScorekeeperAPI {
  if (!apiInstance) {
    const config: GameScorekeeperConfig = {
      baseUrl: "https://api.gamescorekeeper.com",
      token: process.env.GAMESCOREKEEPER_TOKEN || "",
    }

    if (!config.token) {
      throw new Error("GAMESCOREKEEPER_TOKEN environment variable is required")
    }

    apiInstance = new GameScorekeeperAPI(config)
  }

  return apiInstance
}

// Export types for use in other files
export type { Competition, Participant, Fixture, PlayerStats, FixtureStats }
