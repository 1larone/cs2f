// HLTV API integration for real player data and statistics
// Note: This is a mock implementation since HLTV doesn't provide official API
// In production, you would need to use unofficial APIs or web scraping

export interface HLTVPlayer {
  id: number
  nickname: string
  realName: string
  photo: string
  team: {
    id: number
    name: string
    logo: string
  }
  stats: {
    rating: number
    kd: number
    adr: number
    matches: number
  }
  country: string
}

export interface HLTVMatch {
  id: number
  date: string
  team1: {
    id: number
    name: string
    score?: number
  }
  team2: {
    id: number
    name: string
    score?: number
  }
  event: {
    id: number
    name: string
  }
  status: "upcoming" | "live" | "finished"
}

export interface HLTVMatchStats {
  matchId: number
  players: Array<{
    playerId: number
    nickname: string
    kills: number
    deaths: number
    assists: number
    rating: number
    adr: number
    kast: number
  }>
}

// Mock HLTV API client - replace with real implementation
class HLTVClient {
  private baseUrl = "https://hltv-api.vercel.app/api" // Example unofficial API

  async getPlayer(playerId: number): Promise<HLTVPlayer | null> {
    try {
      // Mock implementation с актуальными tier1 игроками
      const mockPlayers: Record<number, HLTVPlayer> = {
        7998: {
          // s1mple (BC.Game)
          id: 7998,
          nickname: "s1mple",
          realName: "Oleksandr Kostyliev",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/7998.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 12345,
            name: "BC.Game",
            logo: "/bc-game-logo.jpg",
          },
          stats: {
            rating: 1.28,
            kd: 1.31,
            adr: 84.2,
            matches: 45,
          },
          country: "UA",
        },
        11893: {
          // ZywOo (Vitality)
          id: 11893,
          nickname: "ZywOo",
          realName: "Mathieu Herbaut",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/11893.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 9565,
            name: "Vitality",
            logo: "/vitality-esports-team-logo.jpg",
          },
          stats: {
            rating: 1.32,
            kd: 1.35,
            adr: 87.3,
            matches: 48,
          },
          country: "FR",
        },
        13666: {
          // sh1ro (Team Spirit)
          id: 13666,
          nickname: "sh1ro",
          realName: "Dmitry Sokolov",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/13666.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 7020,
            name: "Team Spirit",
            logo: "/team-spirit-logo.jpg",
          },
          stats: {
            rating: 1.26,
            kd: 1.29,
            adr: 81.7,
            matches: 42,
          },
          country: "RU",
        },
        20776: {
          // donk (Team Spirit)
          id: 20776,
          nickname: "donk",
          realName: "Danil Kryshkovets",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/20776.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 7020,
            name: "Team Spirit",
            logo: "/team-spirit-logo.jpg",
          },
          stats: {
            rating: 1.24,
            kd: 1.27,
            adr: 79.3,
            matches: 39,
          },
          country: "RU",
        },
        16947: {
          // iM (NAVI)
          id: 16947,
          nickname: "iM",
          realName: "Mihai-Vlad Ivan",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/16947.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 4608,
            name: "NAVI",
            logo: "/navi-esports-team-logo.jpg",
          },
          stats: {
            rating: 1.19,
            kd: 1.22,
            adr: 76.8,
            matches: 41,
          },
          country: "RO",
        },
        19230: {
          // m0NESY (G2)
          id: 19230,
          nickname: "m0NESY",
          realName: "Ilya Osipov",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/19230.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 5995,
            name: "G2",
            logo: "/g2-esports-team-logo.jpg",
          },
          stats: {
            rating: 1.23,
            kd: 1.26,
            adr: 79.8,
            matches: 43,
          },
          country: "RU",
        },
        17978: {
          // broky (FaZe)
          id: 17978,
          nickname: "broky",
          realName: "Helvijs Saukants",
          photo:
            "https://img-cdn.hltv.org/playerbodyshot/17978.png?ixlib=java-2.1.0&w=400&s=0b316c04954ecf578bc76d4e3f7c8c5d",
          team: {
            id: 6667,
            name: "FaZe",
            logo: "/faze-logo.jpg",
          },
          stats: {
            rating: 1.22,
            kd: 1.25,
            adr: 78.4,
            matches: 40,
          },
          country: "LV",
        },
      }

      return mockPlayers[playerId] || null
    } catch (error) {
      console.error("Error fetching player:", error)
      return null
    }
  }

  async getPlayerStats(playerId: number, eventId?: number): Promise<HLTVPlayer["stats"] | null> {
    try {
      // Mock implementation for getting player stats for specific event
      const player = await this.getPlayer(playerId)
      return player?.stats || null
    } catch (error) {
      console.error("Error fetching player stats:", error)
      return null
    }
  }

  async getLiveMatches(): Promise<HLTVMatch[]> {
    try {
      // Mock implementation - replace with real API call
      return [
        {
          id: 2374839,
          date: new Date().toISOString(),
          team1: { id: 4608, name: "NAVI" },
          team2: { id: 9565, name: "Vitality" },
          event: { id: 7148, name: "BLAST Premier Fall Final 2024" },
          status: "live",
        },
      ]
    } catch (error) {
      console.error("Error fetching live matches:", error)
      return []
    }
  }

  async getMatchStats(matchId: number): Promise<HLTVMatchStats | null> {
    try {
      // Mock implementation - replace with real API call
      return {
        matchId,
        players: [
          {
            playerId: 7998,
            nickname: "s1mple",
            kills: 24,
            deaths: 18,
            assists: 5,
            rating: 1.32,
            adr: 89.4,
            kast: 72.0,
          },
        ],
      }
    } catch (error) {
      console.error("Error fetching match stats:", error)
      return null
    }
  }

  async searchPlayers(query: string): Promise<HLTVPlayer[]> {
    try {
      // Mock implementation - replace with real API call
      const allPlayers = await Promise.all([
        this.getPlayer(7998),
        this.getPlayer(11893),
        this.getPlayer(13666),
        this.getPlayer(20776),
        this.getPlayer(16947),
        this.getPlayer(19230),
        this.getPlayer(17978),
      ])

      return allPlayers
        .filter((player): player is HLTVPlayer => player !== null)
        .filter(
          (player) =>
            player.nickname.toLowerCase().includes(query.toLowerCase()) ||
            player.realName.toLowerCase().includes(query.toLowerCase()),
        )
    } catch (error) {
      console.error("Error searching players:", error)
      return []
    }
  }
}

export const hltvClient = new HLTVClient()

// Utility functions for fantasy scoring
export function calculateFantasyPoints(stats: any): number {
  if (!stats) return 0

  const kills = stats.kills || 0
  const deaths = stats.deaths || 0
  const assists = stats.assists || 0
  const rating = stats.rating || 1.0
  const adr = stats.adr || 0

  // Fantasy scoring system
  const killPoints = kills * 2
  const deathPenalty = deaths * -1
  const assistPoints = assists * 1
  const ratingBonus = (rating - 1.0) * 10
  const adrBonus = adr * 0.1

  return Math.round(killPoints + deathPenalty + assistPoints + ratingBonus + adrBonus)
}

export function determineMatchWinner(team1Points: number, team2Points: number): "team1" | "team2" | "draw" {
  if (team1Points > team2Points) return "team1"
  if (team2Points > team1Points) return "team2"
  return "draw"
}
