// Real-time match data integration
import { hltvScraper } from "./hltv-scraper"

export interface LiveMatch {
  id: number
  date: string
  team1: {
    id: number
    name: string
    score: number
    players: number[]
  }
  team2: {
    id: number
    name: string
    score: number
    players: number[]
  }
  event: {
    id: number
    name: string
  }
  status: "upcoming" | "live" | "finished"
  maps: {
    name: string
    team1Score: number
    team2Score: number
    status: "upcoming" | "live" | "finished"
  }[]
}

export interface RealTimeStats {
  matchId: number
  playerId: number
  kills: number
  deaths: number
  assists: number
  adr: number
  rating: number
  kast: number
  headshots: number
  firstKills: number
  firstDeaths: number
  clutchesWon: number
  clutchesLost: number
  multiKills: number
  utilityDamage: number
  flashAssists: number
  mvpRounds: number
}

class MatchDataAPI {
  private hltvApiUrl = "https://hltv-api.vercel.app/api"
  private bo3ApiUrl = "https://api.bo3.gg/v1" // Example BO3.gg API endpoint

  private useCustomScraper = true

  async getLiveMatches(): Promise<LiveMatch[]> {
    try {
      if (this.useCustomScraper) {
        const matches = await hltvScraper.getMatches()
        return this.convertHLTVMatchesToLiveMatches(matches)
      }

      const response = await fetch("/api/hltv/matches?type=live")

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      return data
        .filter((match: any) => match.status === "live")
        .map((match: any) => ({
          id: match.id,
          date: match.date,
          team1: {
            id: match.team1.id,
            name: match.team1.name,
            score: match.team1.score || 0,
            players: match.team1.players || [],
          },
          team2: {
            id: match.team2.id,
            name: match.team2.name,
            score: match.team2.score || 0,
            players: match.team2.players || [],
          },
          event: match.event,
          status: match.status,
          maps: match.maps || [],
        }))
    } catch (error) {
      console.error("Error fetching live matches:", error)
      return this.getMockLiveMatches()
    }
  }

  async getMatchStats(matchId: number): Promise<RealTimeStats[]> {
    try {
      if (this.useCustomScraper) {
        const stats = await hltvScraper.getMatchStats(matchId)
        return this.convertHLTVStatsToRealTimeStats(stats, matchId)
      }

      const response = await fetch(`/api/hltv/matches?type=stats&id=${matchId}`)

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      return (
        data.players?.map((player: any) => ({
          matchId,
          playerId: player.id,
          kills: player.kills || 0,
          deaths: player.deaths || 0,
          assists: player.assists || 0,
          adr: player.adr || 0,
          rating: player.rating || 1.0,
          kast: player.kast || 0,
          headshots: player.headshots || 0,
          firstKills: player.firstKills || 0,
          firstDeaths: player.firstDeaths || 0,
          clutchesWon: player.clutchesWon || 0,
          clutchesLost: player.clutchesLost || 0,
          multiKills: player.multiKills || 0,
          utilityDamage: player.utilityDamage || 0,
          flashAssists: player.flashAssists || 0,
          mvpRounds: player.mvpRounds || 0,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching match stats:", error)
      return this.getMockMatchStats(matchId)
    }
  }

  async getTodayMatches(): Promise<LiveMatch[]> {
    try {
      const response = await fetch("/api/hltv/matches?type=today")

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      return data.filter((match: any) => match.status === "finished" || match.status === "live")
    } catch (error) {
      console.error("Error fetching today matches:", error)
      return []
    }
  }

  private convertHLTVMatchesToLiveMatches(hltvMatches: any[]): LiveMatch[] {
    return hltvMatches.map((match) => ({
      id: match.id,
      date: match.date,
      team1: {
        id: match.team1.id,
        name: match.team1.name,
        score: match.score?.team1 || 0,
        players: [],
      },
      team2: {
        id: match.team2.id,
        name: match.team2.name,
        score: match.score?.team2 || 0,
        players: [],
      },
      event: {
        id: 0,
        name: match.event,
      },
      status: match.status,
      maps: [],
    }))
  }

  private convertHLTVStatsToRealTimeStats(hltvStats: any[], matchId: number): RealTimeStats[] {
    return hltvStats.map((stat) => ({
      matchId,
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
      clutchesWon: 0, // Will be calculated from scraper data
      clutchesLost: 0,
      multiKills: 0,
      utilityDamage: 0,
      flashAssists: 0,
      mvpRounds: 0,
    }))
  }

  private getMockLiveMatches(): LiveMatch[] {
    return [
      {
        id: 2374839,
        date: new Date().toISOString(),
        team1: {
          id: 4608,
          name: "NAVI",
          score: 13,
          players: [16947, 19230, 7998], // iM, m0NESY, s1mple (example)
        },
        team2: {
          id: 9565,
          name: "Vitality",
          score: 11,
          players: [11893, 8183, 7169], // ZywOo, apEX, Magisk
        },
        event: {
          id: 7148,
          name: "BLAST Premier Fall Final 2024",
        },
        status: "live",
        maps: [
          {
            name: "Mirage",
            team1Score: 13,
            team2Score: 11,
            status: "live",
          },
        ],
      },
    ]
  }

  private getMockMatchStats(matchId: number): RealTimeStats[] {
    return [
      {
        matchId,
        playerId: 7998, // s1mple
        kills: 24,
        deaths: 18,
        assists: 5,
        adr: 89.4,
        rating: 1.32,
        kast: 72.0,
        headshots: 12,
        firstKills: 6,
        firstDeaths: 3,
        clutchesWon: 2,
        clutchesLost: 1,
        multiKills: 21, // 1 double kill, 2 triple kills
        utilityDamage: 156,
        flashAssists: 3,
        mvpRounds: 8,
      },
      {
        matchId,
        playerId: 11893, // ZywOo
        kills: 26,
        deaths: 19,
        assists: 4,
        adr: 91.2,
        rating: 1.35,
        kast: 75.0,
        headshots: 14,
        firstKills: 7,
        firstDeaths: 2,
        clutchesWon: 3,
        clutchesLost: 0,
        multiKills: 12, // 1 double kill, 1 triple kill
        utilityDamage: 142,
        flashAssists: 2,
        mvpRounds: 9,
      },
    ]
  }
}

export const matchAPI = new MatchDataAPI()

// Utility function to convert API stats to fantasy performance
export function convertToFantasyPerformance(
  stats: RealTimeStats,
  teamRounds: number,
): import("./fantasy-scoring").MatchPerformance {
  return {
    playerId: stats.playerId,
    matchId: stats.matchId,
    kills: stats.kills,
    deaths: stats.deaths,
    assists: stats.assists,
    headshots: stats.headshots,
    adr: stats.adr,
    rating30: stats.rating,
    kast: stats.kast,
    firstKills: stats.firstKills,
    firstDeaths: stats.firstDeaths,
    clutchesWon: stats.clutchesWon,
    clutchesLost: stats.clutchesLost,
    multiKills: stats.multiKills,
    utilityDamage: stats.utilityDamage,
    flashAssists: stats.flashAssists,
    teamRounds,
    mvpRounds: stats.mvpRounds,
  }
}
