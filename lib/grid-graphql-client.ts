import fetch from "node-fetch"

const GRID_API = "https://api.grid.gg/central-data/graphql"

interface GraphQLResponse<T> {
  data: T
  errors?: Array<{ message: string }>
}

interface SeriesNode {
  id: string
  tournament: { name: string }
  teams: Array<{ id: string; name: string }>
}

interface MatchData {
  id: string
  maps: Array<{
    id: string
    playerStats: Array<{
      player: { id: string; nickname: string; status: string }
      kills: number
      deaths: number
      assists: number
      adr: number
      clutches: number
      mvps: number
      entryDuels: { won: number; lost: number }
    }>
  }>
}

interface PlayerFantasyStats {
  playerId: string
  nickname: string
  kills: number
  deaths: number
  assists: number
  adr: number
  clutches: number
  mvps: number
  entryDuelsWon: number
  entryDuelsLost: number
  fantasyPoints: number
}

class GridGraphQLClient {
  private readonly apiUrl = GRID_API
  private readonly apiKey: string

  constructor() {
    this.apiKey = process.env.GRID_API_KEY || ""
  }

  private async graphqlQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error("GRID API key not configured")
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    })

    const result: GraphQLResponse<T> = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  async getSeries(limit = 5): Promise<SeriesNode[]> {
    const query = `
      query($limit: Int!) {
        allSeries(
          first: $limit,
          filter: { titleId: 26, types: ESPORTS }
          orderBy: StartTimeScheduled
          orderDirection: DESC
        ) {
          edges {
            node {
              id
              tournament { name }
              teams { id name }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery<{
      allSeries: { edges: Array<{ node: SeriesNode }> }
    }>(query, { limit })

    return data.allSeries.edges.map((edge) => edge.node)
  }

  async getMatches(seriesId: string): Promise<MatchData[]> {
    const query = `
      query($id: ID!) {
        series(id: $id) {
          matches {
            id
            maps {
              id
              playerStats {
                player { id nickname status }
                kills
                deaths
                assists
                adr
                clutches
                mvps
                entryDuels { won lost }
              }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery<{
      series: { matches: MatchData[] }
    }>(query, { id: seriesId })

    return data.series.matches
  }

  calculateFantasyPoints(stats: {
    kills: number
    deaths: number
    assists: number
    clutches: number
    mvps: number
    entryDuels: { won: number; lost: number }
    adr: number
  }): number {
    let points = 0

    // Base scoring
    points += stats.kills * 2
    points -= stats.deaths
    points += stats.assists
    points += stats.clutches * 3
    points += stats.mvps * 5
    points += stats.entryDuels.won * 0.5
    points -= stats.entryDuels.lost * 0.5

    // ADR bonus
    if (stats.adr > 70) {
      points += Math.floor((stats.adr - 70) / 10)
    }

    // K/D ratio bonus/penalty
    const kd = stats.kills / Math.max(1, stats.deaths)
    if (kd > 1.0) points += 2
    if (kd < 0.8) points -= 2

    return Math.round(points * 100) / 100 // Round to 2 decimal places
  }

  async getFantasyData(seriesLimit = 3): Promise<PlayerFantasyStats[]> {
    console.log("[v0] Fetching fantasy data from GRID GraphQL API...")

    const allPlayerStats: PlayerFantasyStats[] = []
    const seriesList = await this.getSeries(seriesLimit)

    for (const series of seriesList) {
      console.log(`[v0] Processing series: ${series.tournament.name}`)

      try {
        const matches = await this.getMatches(series.id)

        for (const match of matches) {
          for (const map of match.maps) {
            for (const playerStat of map.playerStats) {
              // Skip inactive players
              if (["inactive", "benched", "retired"].includes(playerStat.player.status)) {
                continue
              }

              const fantasyPoints = this.calculateFantasyPoints(playerStat)

              allPlayerStats.push({
                playerId: playerStat.player.id,
                nickname: playerStat.player.nickname,
                kills: playerStat.kills,
                deaths: playerStat.deaths,
                assists: playerStat.assists,
                adr: playerStat.adr,
                clutches: playerStat.clutches,
                mvps: playerStat.mvps,
                entryDuelsWon: playerStat.entryDuels.won,
                entryDuelsLost: playerStat.entryDuels.lost,
                fantasyPoints,
              })
            }
          }
        }
      } catch (error) {
        console.error(`[v0] Error processing series ${series.id}:`, error)
      }
    }

    console.log(`[v0] Collected fantasy stats for ${allPlayerStats.length} player performances`)
    return allPlayerStats
  }

  async getPlayerAverages(): Promise<Map<string, PlayerFantasyStats>> {
    const allStats = await this.getFantasyData()
    const playerMap = new Map<string, PlayerFantasyStats[]>()

    // Group stats by player
    for (const stat of allStats) {
      if (!playerMap.has(stat.playerId)) {
        playerMap.set(stat.playerId, [])
      }
      playerMap.get(stat.playerId)!.push(stat)
    }

    // Calculate averages
    const averages = new Map<string, PlayerFantasyStats>()

    for (const [playerId, stats] of playerMap) {
      if (stats.length === 0) continue

      const avg: PlayerFantasyStats = {
        playerId,
        nickname: stats[0].nickname,
        kills: stats.reduce((sum, s) => sum + s.kills, 0) / stats.length,
        deaths: stats.reduce((sum, s) => sum + s.deaths, 0) / stats.length,
        assists: stats.reduce((sum, s) => sum + s.assists, 0) / stats.length,
        adr: stats.reduce((sum, s) => sum + s.adr, 0) / stats.length,
        clutches: stats.reduce((sum, s) => sum + s.clutches, 0) / stats.length,
        mvps: stats.reduce((sum, s) => sum + s.mvps, 0) / stats.length,
        entryDuelsWon: stats.reduce((sum, s) => sum + s.entryDuelsWon, 0) / stats.length,
        entryDuelsLost: stats.reduce((sum, s) => sum + s.entryDuelsLost, 0) / stats.length,
        fantasyPoints: stats.reduce((sum, s) => sum + s.fantasyPoints, 0) / stats.length,
      }

      // Round all averages
      Object.keys(avg).forEach((key) => {
        if (typeof avg[key as keyof PlayerFantasyStats] === "number") {
          ;(avg as any)[key] = Math.round((avg as any)[key] * 100) / 100
        }
      })

      averages.set(playerId, avg)
    }

    return averages
  }
}

export const gridGraphQLClient = new GridGraphQLClient()
export type { PlayerFantasyStats, SeriesNode, MatchData }
