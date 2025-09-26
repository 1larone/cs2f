// Упрощенная система для работы с PandaScore и BO3.gg API
export interface CS2Match {
  id: string
  name: string
  status: "live" | "upcoming" | "finished"
  teams: {
    team1: { name: string; logo: string }
    team2: { name: string; logo: string }
  }
  score?: { team1: number; team2: number }
  format: string
  startTime: string
  tournament: string
}

export interface CS2PlayerStats {
  playerId: string
  name: string
  team: string
  matchId: string
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
  entryFrags: number
  supportRounds: number
  fantasyPoints: number
}

class CS2ApiClient {
  private pandaScoreKey: string | undefined
  private bo3BaseUrl = "https://api.bo3.gg"

  constructor() {
    this.pandaScoreKey = process.env.PANDASCORE_API_KEY
  }

  async getPandaScoreMatches(): Promise<CS2Match[]> {
    if (!this.pandaScoreKey) {
      console.log("[v0] PandaScore API key not found, using mock data")
      return this.getMockMatches()
    }

    try {
      const response = await fetch(
        "https://api.pandascore.co/csgo/matches?filter[videogame_title]=cs-2&sort=-begin_at&per_page=20",
        {
          headers: {
            Authorization: `Bearer ${this.pandaScoreKey}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        },
      )

      if (!response.ok) {
        console.log(`[v0] PandaScore API returned ${response.status}, falling back to mock data`)
        return this.getMockMatches()
      }

      const data = await response.json()
      console.log("[v0] PandaScore matches:", data.length)

      return data.map((match: any) => ({
        id: match.id.toString(),
        name: `${match.opponents[0]?.opponent?.name || "TBD"} vs ${match.opponents[1]?.opponent?.name || "TBD"}`,
        status: match.status === "running" ? "live" : match.status === "not_started" ? "upcoming" : "finished",
        teams: {
          team1: {
            name: match.opponents[0]?.opponent?.name || "TBD",
            logo: match.opponents[0]?.opponent?.image_url || "/placeholder.svg?height=32&width=32",
          },
          team2: {
            name: match.opponents[1]?.opponent?.name || "TBD",
            logo: match.opponents[1]?.opponent?.image_url || "/placeholder.svg?height=32&width=32",
          },
        },
        score: match.results
          ? {
              team1: match.results[0]?.score || 0,
              team2: match.results[1]?.score || 0,
            }
          : undefined,
        format: match.number_of_games ? `BO${match.number_of_games}` : "BO3",
        startTime: match.begin_at || new Date().toISOString(),
        tournament: match.tournament?.name || match.league?.name || "Unknown Tournament",
      }))
    } catch (error) {
      if (error instanceof Error) {
        console.log(`[v0] PandaScore API error: ${error.message}, falling back to mock data`)
      } else {
        console.log("[v0] PandaScore API error: Unknown error, falling back to mock data")
      }
      return this.getMockMatches()
    }
  }

  async getBO3PlayerStats(matchId: string): Promise<CS2PlayerStats[]> {
    try {
      // BO3.gg API не поддерживает прямые HTTP запросы для детальной статистики
      // Используем mock данные с улучшенной логикой
      console.log("[v0] BO3.gg API not available via HTTP, using enhanced mock data for match:", matchId)
      return this.getEnhancedMockPlayerStats(matchId)
    } catch (error) {
      console.error("[v0] BO3.gg API error:", error)
      return this.getEnhancedMockPlayerStats(matchId)
    }
  }

  private getEnhancedMockPlayerStats(matchId: string): CS2PlayerStats[] {
    const mockPlayers = [
      {
        name: "s1mple",
        team: "NAVI",
        baseKills: 22,
        baseDeath: 14,
        baseAssists: 7,
        skill: 0.9, // Высокий уровень игрока
      },
      {
        name: "ZywOo",
        team: "Vitality",
        baseKills: 25,
        baseDeath: 12,
        baseAssists: 6,
        skill: 0.95, // Очень высокий уровень
      },
      {
        name: "NiKo",
        team: "G2",
        baseKills: 20,
        baseDeath: 16,
        baseAssists: 9,
        skill: 0.85,
      },
      {
        name: "sh1ro",
        team: "Cloud9",
        baseKills: 18,
        baseDeath: 15,
        baseAssists: 8,
        skill: 0.8,
      },
      {
        name: "device",
        team: "Astralis",
        baseKills: 19,
        baseDeath: 13,
        baseAssists: 5,
        skill: 0.82,
      },
    ]

    return mockPlayers.map((player, index) => {
      // Добавляем случайность на основе уровня игрока
      const variance = (Math.random() - 0.5) * 0.3 * player.skill
      const kills = Math.max(5, Math.round(player.baseKills + variance * 10))
      const deaths = Math.max(3, Math.round(player.baseDeath + variance * -5))
      const assists = Math.max(1, Math.round(player.baseAssists + variance * 5))

      const stats: CS2PlayerStats = {
        playerId: `enhanced-${index}-${matchId}`,
        name: player.name,
        team: player.team,
        matchId,
        kills,
        deaths,
        assists,
        adr: Math.round(65 + player.skill * 30 + variance * 15),
        rating: Math.round((1.0 + player.skill * 0.5 + variance * 0.3) * 100) / 100,
        kast: Math.round(65 + player.skill * 25 + variance * 10),
        headshots: Math.round(25 + player.skill * 25 + variance * 15),
        firstKills: Math.floor(Math.random() * 8 * player.skill),
        firstDeaths: Math.floor(Math.random() * 5 * (1 - player.skill)),
        clutchesWon: Math.floor(Math.random() * 4 * player.skill),
        clutchesLost: Math.floor(Math.random() * 3 * (1 - player.skill)),
        multiKills: Math.floor(Math.random() * 5 * player.skill),
        utilityDamage: Math.floor(50 + Math.random() * 150 * player.skill),
        flashAssists: Math.floor(Math.random() * 8 * player.skill),
        mvpRounds: Math.floor(Math.random() * 8 * player.skill),
        entryFrags: Math.floor(Math.random() * 7 * player.skill),
        supportRounds: Math.floor(Math.random() * 20),
        fantasyPoints: 0,
      }

      stats.fantasyPoints = this.calculateFantasyPoints(stats)
      return stats
    })
  }

  private calculateFantasyPoints(stats: CS2PlayerStats): number {
    let points = 0

    // Основные очки
    points += stats.kills * 2 // 2 очка за килл
    points -= stats.deaths * 1 // -1 очко за смерть
    points += stats.assists * 1 // 1 очко за ассист

    // Бонусные очки
    points += stats.firstKills * 1 // 1 бонус за первый килл
    points += stats.clutchesWon * 3 // 3 очка за выигранный клатч
    points += stats.multiKills * 2 // 2 очка за мультикилл
    points += stats.mvpRounds * 2 // 2 очка за MVP раунда
    points += stats.entryFrags * 1 // 1 очко за entry frag

    // Штрафы
    points -= stats.firstDeaths * 0.5 // -0.5 за первую смерть
    points -= stats.clutchesLost * 1 // -1 за проигранный клатч

    return Math.round(points * 10) / 10 // Округляем до 1 знака
  }

  private getMockMatches(): CS2Match[] {
    const tournaments = [
      "IEM Katowice 2025",
      "ESL Pro League Season 19",
      "BLAST Premier Spring",
      "PGL Major Copenhagen",
      "FACEIT Major",
    ]

    const teams = [
      { name: "NAVI", logo: "/navi-logo.png" },
      { name: "Vitality", logo: "/vitality-logo.png" },
      { name: "G2", logo: "/g2-esports-logo.png" },
      { name: "FaZe", logo: "/faze-clan-inspired-logo.png" },
      { name: "Astralis", logo: "/astralis-logo.jpg" },
      { name: "Cloud9", logo: "/cloud9-logo.jpg" },
      { name: "MOUZ", logo: "/mouz-logo.png" },
      { name: "Liquid", logo: "/team-liquid-logo.jpg" },
    ]

    const matches: CS2Match[] = []

    for (let i = 0; i < 8; i++) {
      const team1 = teams[Math.floor(Math.random() * teams.length)]
      let team2 = teams[Math.floor(Math.random() * teams.length)]
      while (team2.name === team1.name) {
        team2 = teams[Math.floor(Math.random() * teams.length)]
      }

      const statuses: ("live" | "upcoming" | "finished")[] = ["live", "upcoming", "finished"]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      matches.push({
        id: `enhanced-mock-${i}`,
        name: `${team1.name} vs ${team2.name}`,
        status,
        teams: { team1, team2 },
        score:
          status === "finished" || status === "live"
            ? {
                team1: Math.floor(Math.random() * 3),
                team2: Math.floor(Math.random() * 3),
              }
            : undefined,
        format: "BO3",
        startTime:
          status === "upcoming"
            ? new Date(Date.now() + Math.random() * 86400000).toISOString()
            : new Date(Date.now() - Math.random() * 86400000).toISOString(),
        tournament: tournaments[Math.floor(Math.random() * tournaments.length)],
      })
    }

    return matches
  }
}

export const cs2ApiClient = new CS2ApiClient()
