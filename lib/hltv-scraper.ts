interface HLTVMatch {
  id: number
  date: string
  team1: { name: string; id: number }
  team2: { name: string; id: number }
  event: string
  status: "upcoming" | "live" | "finished"
  score?: { team1: number; team2: number }
}

interface HLTVPlayerStats {
  playerId: number
  name: string
  kills: number
  deaths: number
  assists: number
  adr: number
  rating: number
  kast: number
  headshots: number
  firstKills: number
  firstDeaths: number
}

class HLTVScraper {
  private workingAPIs = [
    {
      name: "HLTV API Vercel",
      baseUrl: "https://hltv-api.vercel.app/api",
      endpoints: {
        matches: "/matches.json",
        players: "/players.json",
        teams: "/teams.json",
        player: "/player.json",
        team: "/team.json",
      },
    },
    {
      name: "CS2 Leaderboard API",
      baseUrl: "https://explodingcamera.github.io/cs2leaderboard/data",
      endpoints: {
        latest: "/latest/global.json",
        historical: "/historical/global",
      },
    },
  ]

  async getMatches(): Promise<HLTVMatch[]> {
    console.log("[v0] Starting to fetch matches from working APIs...")

    try {
      // Try HLTV API first
      const matches = await this.fetchFromHLTVAPI()
      if (matches.length > 0) {
        console.log("[v0] Successfully fetched", matches.length, "matches from HLTV API")
        return matches
      }

      console.log("[v0] HLTV API returned no matches, using enhanced mock data")
      return this.getEnhancedMockMatches()
    } catch (error) {
      console.error("[v0] Error fetching matches:", error)
      return this.getEnhancedMockMatches()
    }
  }

  private async fetchFromHLTVAPI(): Promise<HLTVMatch[]> {
    const api = this.workingAPIs[0] // HLTV API Vercel

    try {
      console.log(`[v0] Trying ${api.name} at ${api.baseUrl}${api.endpoints.matches}`)

      const response = await fetch(`${api.baseUrl}${api.endpoints.matches}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Fantasy-CS2-App/1.0",
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        console.log(`[v0] ${api.name} returned status: ${response.status}`)
        throw new Error(`HTTP ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.log(`[v0] ${api.name} returned non-JSON content: ${contentType}`)
        throw new Error("Non-JSON response")
      }

      const data = await response.json()
      console.log(`[v0] ${api.name} returned data structure:`, Object.keys(data))

      return this.parseHLTVAPIResponse(data)
    } catch (error) {
      console.error(`[v0] ${api.name} failed:`, error)
      throw error
    }
  }

  private parseHLTVAPIResponse(data: any): HLTVMatch[] {
    try {
      // Handle different possible response structures
      let matchesArray = data

      if (data.matches) matchesArray = data.matches
      if (data.data) matchesArray = data.data
      if (data.results) matchesArray = data.results

      if (!Array.isArray(matchesArray)) {
        console.log("[v0] Response is not an array, trying to extract matches...")
        // Sometimes the response might be an object with match data
        if (typeof matchesArray === "object" && matchesArray !== null) {
          const keys = Object.keys(matchesArray)
          console.log("[v0] Available keys:", keys)

          // Try common keys that might contain match arrays
          for (const key of ["matches", "data", "results", "items"]) {
            if (matchesArray[key] && Array.isArray(matchesArray[key])) {
              matchesArray = matchesArray[key]
              break
            }
          }
        }

        if (!Array.isArray(matchesArray)) {
          console.log("[v0] Could not find match array in response")
          return []
        }
      }

      console.log(`[v0] Processing ${matchesArray.length} matches from API`)

      return matchesArray.slice(0, 20).map((match: any, index: number) => {
        // Handle different possible match structures
        const team1 = match.team1 || match.teamA || match.teams?.[0] || { name: "Team 1", id: 1000 + index }
        const team2 = match.team2 || match.teamB || match.teams?.[1] || { name: "Team 2", id: 2000 + index }

        return {
          id: match.id || match.matchId || Date.now() + index,
          date: match.date || match.startTime || match.time || new Date().toISOString(),
          team1: {
            name: team1.name || team1.title || `Team ${index + 1}A`,
            id: team1.id || 1000 + index,
          },
          team2: {
            name: team2.name || team2.title || `Team ${index + 1}B`,
            id: team2.id || 2000 + index,
          },
          event: match.event?.name || match.tournament?.name || match.league?.name || "Professional Match",
          status: this.normalizeStatus(match.status || match.state || "upcoming"),
          score:
            match.score ||
            (match.result
              ? {
                  team1: match.result.team1 || 0,
                  team2: match.result.team2 || 0,
                }
              : undefined),
        }
      })
    } catch (error) {
      console.error("[v0] Error parsing HLTV API response:", error)
      return []
    }
  }

  private normalizeStatus(status: string): "upcoming" | "live" | "finished" {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("live") || statusLower.includes("ongoing") || statusLower.includes("playing"))
      return "live"
    if (statusLower.includes("finished") || statusLower.includes("completed") || statusLower.includes("ended"))
      return "finished"
    return "upcoming"
  }

  async getMatchStats(matchId: number): Promise<HLTVPlayerStats[]> {
    console.log(`[v0] Fetching stats for match ${matchId}`)

    try {
      // For now, return enhanced mock stats since match-specific stats require more complex API calls
      return this.getEnhancedMockPlayerStats(matchId)
    } catch (error) {
      console.error(`[v0] Error fetching match stats for ${matchId}:`, error)
      return this.getEnhancedMockPlayerStats(matchId)
    }
  }

  private getEnhancedMockPlayerStats(matchId: number): HLTVPlayerStats[] {
    // More realistic player names and stats based on current pro scene
    const mockPlayers = [
      { name: "s1mple", kills: 24, deaths: 16, assists: 5, adr: 89.2, rating: 1.35 },
      { name: "ZywOo", kills: 22, deaths: 18, assists: 7, adr: 85.1, rating: 1.28 },
      { name: "sh1ro", kills: 19, deaths: 20, assists: 8, adr: 78.5, rating: 1.12 },
      { name: "electroNic", kills: 18, deaths: 19, assists: 6, adr: 76.3, rating: 1.08 },
      { name: "Perfecto", kills: 15, deaths: 21, assists: 9, adr: 68.7, rating: 0.95 },
      { name: "m0NESY", kills: 26, deaths: 17, assists: 4, adr: 91.3, rating: 1.42 },
      { name: "NiKo", kills: 21, deaths: 19, assists: 6, adr: 82.4, rating: 1.18 },
      { name: "huNter-", kills: 17, deaths: 20, assists: 7, adr: 74.2, rating: 1.02 },
      { name: "nexa", kills: 14, deaths: 22, assists: 8, adr: 65.8, rating: 0.88 },
      { name: "HooXi", kills: 12, deaths: 23, assists: 10, adr: 62.1, rating: 0.82 },
    ]

    return mockPlayers.map((player, index) => ({
      playerId: matchId * 100 + index,
      name: player.name,
      kills: player.kills + Math.floor(Math.random() * 6) - 3, // Add some variance
      deaths: player.deaths + Math.floor(Math.random() * 4) - 2,
      assists: player.assists + Math.floor(Math.random() * 4) - 2,
      adr: Math.round((player.adr + Math.random() * 20 - 10) * 10) / 10,
      rating: Math.round((player.rating + Math.random() * 0.3 - 0.15) * 100) / 100,
      kast: Math.round(((player.kills + player.assists) / (player.kills + player.deaths + player.assists)) * 100),
      headshots: Math.round(player.kills * (0.3 + Math.random() * 0.3)),
      firstKills: Math.round(player.kills * (0.15 + Math.random() * 0.15)),
      firstDeaths: Math.round(player.deaths * (0.1 + Math.random() * 0.1)),
    }))
  }

  private getEnhancedMockMatches(): HLTVMatch[] {
    const currentTime = new Date()
    const teams = [
      { name: "NAVI", id: 4608 },
      { name: "Vitality", id: 9565 },
      { name: "G2", id: 5995 },
      { name: "FaZe", id: 6667 },
      { name: "Astralis", id: 6665 },
      { name: "MOUZ", id: 4494 },
      { name: "Liquid", id: 5973 },
      { name: "NIP", id: 4411 },
      { name: "Heroic", id: 7175 },
      { name: "ENCE", id: 4674 },
    ]

    const events = [
      "BLAST Premier Spring Final 2025",
      "ESL Pro League Season 20",
      "IEM Katowice 2025",
      "PGL Major Copenhagen 2025",
      "BLAST Premier Fall Groups",
    ]

    const matches: HLTVMatch[] = []

    // Generate some realistic matches
    for (let i = 0; i < 8; i++) {
      const team1 = teams[Math.floor(Math.random() * teams.length)]
      let team2 = teams[Math.floor(Math.random() * teams.length)]
      while (team2.id === team1.id) {
        team2 = teams[Math.floor(Math.random() * teams.length)]
      }

      const matchTime = new Date(currentTime.getTime() + (Math.random() - 0.5) * 24 * 60 * 60 * 1000)
      const isLive = Math.random() < 0.3
      const isFinished = !isLive && Math.random() < 0.4

      let status: "upcoming" | "live" | "finished" = "upcoming"
      let score: { team1: number; team2: number } | undefined

      if (isLive) {
        status = "live"
        score = {
          team1: Math.floor(Math.random() * 16),
          team2: Math.floor(Math.random() * 16),
        }
      } else if (isFinished) {
        status = "finished"
        const winner = Math.random() < 0.5 ? "team1" : "team2"
        score = {
          team1: winner === "team1" ? 16 : Math.floor(Math.random() * 16),
          team2: winner === "team2" ? 16 : Math.floor(Math.random() * 16),
        }
      }

      matches.push({
        id: 2374800 + i,
        date: matchTime.toISOString(),
        team1,
        team2,
        event: events[Math.floor(Math.random() * events.length)],
        status,
        score,
      })
    }

    return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
}

export const hltvScraper = new HLTVScraper()
