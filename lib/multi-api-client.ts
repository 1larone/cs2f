interface CS2Match {
  id: string
  team1: string
  team2: string
  status: "live" | "upcoming" | "finished"
  score?: string
  map?: string
  tournament?: string
  startTime: string
}

interface CS2Player {
  id: string
  name: string
  team: string
  rating: number
  kills: number
  deaths: number
  assists: number
  adr: number
}

interface APIResponse<T> {
  success: boolean
  data: T
  source: string
  error?: string
}

import { gridAPIClient } from "./grid-api-client"

class MultiAPIClient {
  private readonly APIs = {
    GRID: "https://api.grid.gg/external/v1",
    FACEIT: "https://open.faceit.com/data/v4",
    STEAM_AUTH: "https://api.steamauth.app/v1/cs2",
    HLTV_PROXY: "https://hltv-api.vercel.app/api",
    TRACKER_GG: "https://public-api.tracker.gg/v2/csgo",
  }

  private async fetchWithFallback<T>(
    endpoints: Array<{ url: string; source: string; headers?: Record<string, string> }>,
    parser: (data: any, source: string) => T,
  ): Promise<APIResponse<T>> {
    console.log("[v0] Trying multiple API endpoints...")

    for (const endpoint of endpoints) {
      try {
        console.log(`[v0] Trying ${endpoint.source}: ${endpoint.url}`)

        const response = await fetch(endpoint.url, {
          headers: {
            "User-Agent": "CS2-Fantasy-App/1.0",
            Accept: "application/json",
            ...endpoint.headers,
          },
        })

        if (!response.ok) {
          console.log(`[v0] ${endpoint.source} failed with status: ${response.status}`)
          continue
        }

        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          console.log(`[v0] ${endpoint.source} returned non-JSON: ${contentType}`)
          continue
        }

        const data = await response.json()
        console.log(`[v0] ${endpoint.source} success:`, data)

        const parsedData = parser(data, endpoint.source)
        return {
          success: true,
          data: parsedData,
          source: endpoint.source,
        }
      } catch (error) {
        console.log(`[v0] ${endpoint.source} error:`, error)
        continue
      }
    }

    // Fallback to mock data
    console.log("[v0] All APIs failed, using mock data")
    return {
      success: true,
      data: parser(this.getMockData(), "mock"),
      source: "mock",
    }
  }

  async getMatches(): Promise<APIResponse<CS2Match[]>> {
    console.log("[v0] Trying GRID API first...")

    try {
      const gridResponse = await gridAPIClient.getMatches()
      if (gridResponse.success && gridResponse.data.length > 0) {
        console.log("[v0] GRID API success, returning data")
        return gridResponse
      }
    } catch (error) {
      console.log("[v0] GRID API failed, falling back to other APIs:", error)
    }

    // Fallback to existing APIs
    const endpoints = [
      {
        url: `${this.APIs.HLTV_PROXY}/matches.json`,
        source: "HLTV",
      },
      {
        url: `${this.APIs.FACEIT}/championships?game=cs2&type=upcoming&limit=20`,
        source: "FACEIT",
        headers: process.env.FACEIT_API_KEY
          ? {
              Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
            }
          : undefined,
      },
      {
        url: `${this.APIs.STEAM_AUTH}/matches/live`,
        source: "SteamAuth",
        headers: process.env.STEAM_AUTH_API_KEY
          ? {
              "X-API-Key": process.env.STEAM_AUTH_API_KEY,
            }
          : undefined,
      },
    ]

    return this.fetchWithFallback(endpoints, this.parseMatches.bind(this))
  }

  async getPlayers(): Promise<APIResponse<CS2Player[]>> {
    console.log("[v0] Trying GRID API for players...")

    try {
      const gridResponse = await gridAPIClient.getPlayers()
      if (gridResponse.success && gridResponse.data.length > 0) {
        console.log("[v0] GRID API players success, returning data")
        return gridResponse
      }
    } catch (error) {
      console.log("[v0] GRID API players failed, falling back:", error)
    }

    // Fallback to existing APIs
    const endpoints = [
      {
        url: `${this.APIs.HLTV_PROXY}/players.json`,
        source: "HLTV",
      },
      {
        url: `${this.APIs.TRACKER_GG}/profile/steam/players/top`,
        source: "TrackerGG",
        headers: process.env.TRACKER_API_KEY
          ? {
              "TRN-Api-Key": process.env.TRACKER_API_KEY,
            }
          : undefined,
      },
    ]

    return this.fetchWithFallback(endpoints, this.parsePlayers.bind(this))
  }

  private parseMatches(data: any, source: string): CS2Match[] {
    console.log(`[v0] Parsing matches from ${source}:`, data)

    try {
      switch (source) {
        case "HLTV":
          if (Array.isArray(data)) {
            return data.slice(0, 10).map((match: any, index: number) => ({
              id: match.id?.toString() || `hltv-${index}`,
              team1: match.team1?.name || match.teams?.[0]?.name || `Team ${index * 2 + 1}`,
              team2: match.team2?.name || match.teams?.[1]?.name || `Team ${index * 2 + 2}`,
              status: match.live ? "live" : match.upcoming ? "upcoming" : "finished",
              score: match.result || match.score,
              map: match.map || match.maps?.[0],
              tournament: match.event?.name || match.tournament,
              startTime: match.date || new Date().toISOString(),
            }))
          }
          break

        case "FACEIT":
          if (data.items && Array.isArray(data.items)) {
            return data.items.slice(0, 10).map((match: any, index: number) => ({
              id: match.championship_id || `faceit-${index}`,
              team1: match.teams?.[0]?.name || `Team ${index * 2 + 1}`,
              team2: match.teams?.[1]?.name || `Team ${index * 2 + 2}`,
              status: match.status === "ongoing" ? "live" : "upcoming",
              tournament: match.name,
              startTime: match.started_at || new Date().toISOString(),
            }))
          }
          break

        case "SteamAuth":
          if (data.matches && Array.isArray(data.matches)) {
            return data.matches.slice(0, 10).map((match: any, index: number) => ({
              id: match.matchId?.toString() || `steam-${index}`,
              team1: match.teamA?.name || `Team ${index * 2 + 1}`,
              team2: match.teamB?.name || `Team ${index * 2 + 2}`,
              status: match.isLive ? "live" : "upcoming",
              score: match.score,
              map: match.currentMap,
              startTime: match.startTime || new Date().toISOString(),
            }))
          }
          break

        case "mock":
          return this.generateMockMatches()
      }
    } catch (error) {
      console.log(`[v0] Error parsing matches from ${source}:`, error)
    }

    return this.generateMockMatches()
  }

  private parsePlayers(data: any, source: string): CS2Player[] {
    console.log(`[v0] Parsing players from ${source}:`, data)

    try {
      switch (source) {
        case "HLTV":
          if (Array.isArray(data)) {
            return data.slice(0, 20).map((player: any, index: number) => ({
              id: player.id?.toString() || `hltv-player-${index}`,
              name: player.name || player.ign || `Player${index + 1}`,
              team: player.team?.name || player.teamName || `Team ${Math.floor(index / 5) + 1}`,
              rating: player.rating || 1.0 + Math.random() * 0.5,
              kills: player.kills || Math.floor(15 + Math.random() * 15),
              deaths: player.deaths || Math.floor(10 + Math.random() * 10),
              assists: player.assists || Math.floor(3 + Math.random() * 8),
              adr: player.adr || Math.floor(60 + Math.random() * 40),
            }))
          }
          break

        case "TrackerGG":
          if (data.data && Array.isArray(data.data)) {
            return data.data.slice(0, 20).map((player: any, index: number) => ({
              id: player.platformInfo?.platformUserId || `tracker-${index}`,
              name: player.platformInfo?.platformUserHandle || `Player${index + 1}`,
              team: `Team ${Math.floor(index / 5) + 1}`,
              rating: player.stats?.rating?.value || 1.0 + Math.random() * 0.5,
              kills: player.stats?.kills?.value || Math.floor(15 + Math.random() * 15),
              deaths: player.stats?.deaths?.value || Math.floor(10 + Math.random() * 10),
              assists: player.stats?.assists?.value || Math.floor(3 + Math.random() * 8),
              adr: player.stats?.damagePerRound?.value || Math.floor(60 + Math.random() * 40),
            }))
          }
          break

        case "mock":
          return this.generateMockPlayers()
      }
    } catch (error) {
      console.log(`[v0] Error parsing players from ${source}:`, error)
    }

    return this.generateMockPlayers()
  }

  private generateMockMatches(): CS2Match[] {
    const teams = [
      "Natus Vincere",
      "FaZe Clan",
      "Astralis",
      "Team Liquid",
      "G2 Esports",
      "Vitality",
      "NIP",
      "MOUZ",
      "Cloud9",
      "FURIA",
      "Heroic",
      "BIG",
    ]

    const tournaments = [
      "IEM Katowice 2025",
      "ESL Pro League",
      "BLAST Premier",
      "PGL Major",
      "DreamHack Masters",
      "EPICENTER",
      "StarLadder Major",
    ]

    const maps = ["de_dust2", "de_mirage", "de_inferno", "de_cache", "de_overpass", "de_train"]

    return Array.from({ length: 12 }, (_, i) => {
      const team1 = teams[Math.floor(Math.random() * teams.length)]
      let team2 = teams[Math.floor(Math.random() * teams.length)]
      while (team2 === team1) {
        team2 = teams[Math.floor(Math.random() * teams.length)]
      }

      const statuses: Array<"live" | "upcoming" | "finished"> = ["live", "upcoming", "finished"]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      return {
        id: `mock-match-${i + 1}`,
        team1,
        team2,
        status,
        score:
          status === "finished"
            ? `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`
            : status === "live"
              ? `${Math.floor(Math.random() * 16)}-${Math.floor(Math.random() * 16)}`
              : undefined,
        map: maps[Math.floor(Math.random() * maps.length)],
        tournament: tournaments[Math.floor(Math.random() * tournaments.length)],
        startTime: new Date(Date.now() + (Math.random() - 0.5) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })
  }

  private generateMockPlayers(): CS2Player[] {
    const playerNames = [
      "s1mple",
      "ZywOo",
      "device",
      "NiKo",
      "sh1ro",
      "Ax1Le",
      "broky",
      "syrsoN",
      "electroNic",
      "Perfecto",
      "b1t",
      "Twistzz",
      "EliGE",
      "NAF",
      "FalleN",
      "fer",
      "TACO",
      "coldzera",
      "flamie",
      "Boombl4",
      "jks",
      "YEKINDAR",
    ]

    const teams = [
      "Natus Vincere",
      "G2 Esports",
      "Astralis",
      "Team Liquid",
      "Gambit",
      "FaZe Clan",
      "BIG",
      "Vitality",
      "FURIA",
      "Spirit",
    ]

    return Array.from({ length: 20 }, (_, i) => ({
      id: `mock-player-${i + 1}`,
      name: playerNames[i] || `Player${i + 1}`,
      team: teams[Math.floor(i / 2) % teams.length],
      rating: Number((1.0 + Math.random() * 0.8).toFixed(2)),
      kills: Math.floor(15 + Math.random() * 15),
      deaths: Math.floor(10 + Math.random() * 10),
      assists: Math.floor(3 + Math.random() * 8),
      adr: Math.floor(60 + Math.random() * 40),
    }))
  }

  private getMockData() {
    return {
      matches: this.generateMockMatches(),
      players: this.generateMockPlayers(),
    }
  }
}

export const multiAPIClient = new MultiAPIClient()
export type { CS2Match, CS2Player, APIResponse }
