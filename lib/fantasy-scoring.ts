// Fantasy CS2 scoring system based on roles, tiers and real match performance
export interface MatchPerformance {
  playerId: number
  matchId: number
  kills: number
  deaths: number
  assists: number
  headshots: number
  adr: number // Average Damage per Round
  rating30: number // HLTV Rating 3.0
  kast: number // Kill, Assist, Survive, Trade percentage
  firstKills: number
  firstDeaths: number
  clutchesWon: number
  clutchesLost: number
  multiKills: number // 2k, 3k, 4k, 5k
  utilityDamage: number
  flashAssists: number
  teamRounds: number // Total rounds played by team
  mvpRounds: number // Rounds where player was MVP
  playerRole: "AWP" | "Entry" | "Rifler" | "Support" | "IGL"
  playerTier: "Tier1" | "Tier2" | "Tier3"
}

export interface FantasyPoints {
  playerId: number
  totalPoints: number
  breakdown: {
    kills: number
    deaths: number
    assists: number
    headshots: number
    adr: number
    rating: number
    kast: number
    firstKills: number
    firstDeaths: number
    clutches: number
    multiKills: number
    utility: number
    mvp: number
  }
}

export const TIER_MULTIPLIERS = {
  Tier1: 1.2, // +20% очков за те же действия
  Tier2: 1.0, // базовые очки
  Tier3: 0.8, // -20% очков
}

export const ROLE_BONUSES = {
  AWP: {
    KILL: 0.5, // дополнительные очки за килл
    FIRST_KILL: 1, // дополнительные очки за первый килл
  },
  Entry: {
    FIRST_KILL: 2, // большой бонус за первый килл
    FIRST_DEATH: 1, // меньший штраф за первую смерть
  },
  Rifler: {
    KILL: 0.2, // небольшой бонус за килл
    MULTI_KILL: 1, // бонус за мультикиллы
  },
  Support: {
    ASSIST: 0.5, // дополнительные очки за ассист
    UTILITY: 0.5, // бонус за утилити
    FLASH_ASSIST: 0.5,
  },
  IGL: {
    MVP_ROUND: 1, // дополнительные очки за MVP раунды
    WIN_BONUS: 2, // дополнительный бонус за победу команды
  },
}

export const AVERAGE_POINTS_BY_TIER = {
  Tier1: 15, // средние очки для Tier1 игроков
  Tier2: 12, // средние очки для Tier2 игроков
  Tier3: 9, // средние очки для Tier3 игроков
}

// Fantasy scoring rules (similar to Fantacalcio)
export const SCORING_RULES = {
  // Basic stats
  KILL: 2,
  DEATH: -1,
  ASSIST: 1,
  HEADSHOT_BONUS: 0.5,

  // Performance bonuses
  ADR_MULTIPLIER: 0.05, // 0.05 points per ADR point
  RATING_MULTIPLIER: 10, // (rating - 1.0) * 10
  KAST_MULTIPLIER: 0.1, // 0.1 points per KAST%

  // Special actions
  FIRST_KILL: 3,
  FIRST_DEATH: -2,
  CLUTCH_WON: 5,
  CLUTCH_LOST: -1,

  // Multi-kills
  DOUBLE_KILL: 2,
  TRIPLE_KILL: 5,
  QUADRA_KILL: 10,
  ACE: 20,

  // Team play
  UTILITY_DAMAGE_MULTIPLIER: 0.02,
  FLASH_ASSIST: 1,
  MVP_ROUND: 2,

  // Match result bonus
  WIN_BONUS: 5,
  LOSS_PENALTY: 0,
}

export function calculateFantasyPoints(performance: MatchPerformance, teamWon: boolean): FantasyPoints {
  const tierMultiplier = TIER_MULTIPLIERS[performance.playerTier]
  const roleBonuses = ROLE_BONUSES[performance.playerRole]

  const breakdown = {
    kills: (performance.kills * SCORING_RULES.KILL + (roleBonuses.KILL || 0) * performance.kills) * tierMultiplier,
    deaths: performance.deaths * SCORING_RULES.DEATH * tierMultiplier,
    assists:
      (performance.assists * SCORING_RULES.ASSIST + (roleBonuses.ASSIST || 0) * performance.assists) * tierMultiplier,
    headshots: performance.headshots * SCORING_RULES.HEADSHOT_BONUS * tierMultiplier,
    adr: performance.adr * SCORING_RULES.ADR_MULTIPLIER * tierMultiplier,
    rating: (performance.rating30 - 1.0) * SCORING_RULES.RATING_MULTIPLIER * tierMultiplier,
    kast: performance.kast * SCORING_RULES.KAST_MULTIPLIER * tierMultiplier,
    firstKills:
      (performance.firstKills * SCORING_RULES.FIRST_KILL + (roleBonuses.FIRST_KILL || 0) * performance.firstKills) *
      tierMultiplier,
    firstDeaths:
      (performance.firstDeaths * SCORING_RULES.FIRST_DEATH + (roleBonuses.FIRST_DEATH || 0) * performance.firstDeaths) *
      tierMultiplier,
    clutches:
      (performance.clutchesWon * SCORING_RULES.CLUTCH_WON + performance.clutchesLost * SCORING_RULES.CLUTCH_LOST) *
      tierMultiplier,
    multiKills: calculateMultiKillPoints(performance.multiKills, performance.playerRole) * tierMultiplier,
    utility:
      (performance.utilityDamage * SCORING_RULES.UTILITY_DAMAGE_MULTIPLIER * (1 + (roleBonuses.UTILITY || 0)) +
        performance.flashAssists * SCORING_RULES.FLASH_ASSIST * (1 + (roleBonuses.FLASH_ASSIST || 0))) *
      tierMultiplier,
    mvp:
      (performance.mvpRounds * SCORING_RULES.MVP_ROUND + (roleBonuses.MVP_ROUND || 0) * performance.mvpRounds) *
      tierMultiplier,
  }

  // Team result bonus with role bonus
  const teamBonus = teamWon
    ? (SCORING_RULES.WIN_BONUS + (roleBonuses.WIN_BONUS || 0)) * tierMultiplier
    : SCORING_RULES.LOSS_PENALTY

  const totalPoints = Object.values(breakdown).reduce((sum, points) => sum + points, 0) + teamBonus

  return {
    playerId: performance.playerId,
    totalPoints: Math.round(totalPoints * 100) / 100,
    breakdown: {
      ...breakdown,
      mvp: breakdown.mvp + teamBonus,
    },
  }
}

function calculateMultiKillPoints(multiKills: number, role: string): number {
  const doubleKills = multiKills % 10
  const tripleKills = Math.floor(multiKills / 10) % 10
  const quadraKills = Math.floor(multiKills / 100) % 10
  const aces = Math.floor(multiKills / 1000) % 10

  const roleBonus = role === "Rifler" ? ROLE_BONUSES.Rifler.MULTI_KILL || 0 : 0

  return (
    doubleKills * (SCORING_RULES.DOUBLE_KILL + roleBonus) +
    tripleKills * (SCORING_RULES.TRIPLE_KILL + roleBonus) +
    quadraKills * (SCORING_RULES.QUADRA_KILL + roleBonus) +
    aces * (SCORING_RULES.ACE + roleBonus)
  )
}

export interface TeamCompositionRules {
  maxTier1: number // максимум Tier1 игроков
  maxTier2: number // максимум Tier2 игроков
  maxTier3: number // максимум Tier3 игроков
  maxFromSameTeam: number // максимум игроков из одной команды
  totalPlayers: number // общее количество игроков в составе
}

export const DEFAULT_COMPOSITION_RULES: TeamCompositionRules = {
  maxTier1: 2,
  maxTier2: 2,
  maxTier3: 1,
  maxFromSameTeam: 2,
  totalPlayers: 5,
}

export function getAveragePointsForNonPlaying(tier: "Tier1" | "Tier2" | "Tier3", hasPlayingOpponents: boolean): number {
  let basePoints = AVERAGE_POINTS_BY_TIER[tier]

  // +30% корректировка если у соперника игроки участвуют
  if (hasPlayingOpponents && (tier === "Tier2" || tier === "Tier3")) {
    basePoints *= 1.3
  }

  return Math.round(basePoints * 100) / 100
}

export function validateTeamComposition(
  players: { tier: "Tier1" | "Tier2" | "Tier3"; team: string }[],
  rules: TeamCompositionRules = DEFAULT_COMPOSITION_RULES,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Проверка общего количества игроков
  if (players.length !== rules.totalPlayers) {
    errors.push(`Нужно выбрать ${rules.totalPlayers} игроков, выбрано ${players.length}`)
  }

  // Подсчёт игроков по тирам
  const tierCounts = players.reduce(
    (acc, player) => {
      acc[player.tier] = (acc[player.tier] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if ((tierCounts.Tier1 || 0) > rules.maxTier1) {
    errors.push(`Максимум ${rules.maxTier1} игроков Tier1, выбрано ${tierCounts.Tier1}`)
  }
  if ((tierCounts.Tier2 || 0) > rules.maxTier2) {
    errors.push(`Максимум ${rules.maxTier2} игроков Tier2, выбрано ${tierCounts.Tier2}`)
  }
  if ((tierCounts.Tier3 || 0) > rules.maxTier3) {
    errors.push(`Максимум ${rules.maxTier3} игроков Tier3, выбрано ${tierCounts.Tier3}`)
  }

  // Проверка игроков из одной команды
  const teamCounts = players.reduce(
    (acc, player) => {
      acc[player.team] = (acc[player.team] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  Object.entries(teamCounts).forEach(([team, count]) => {
    if (count > rules.maxFromSameTeam) {
      errors.push(`Максимум ${rules.maxFromSameTeam} игроков из команды ${team}, выбрано ${count}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Fantasy league comparison
export interface FantasyTeam {
  userId: string
  teamName: string
  players: number[] // Array of player IDs
  totalPoints: number
  playerPoints: FantasyPoints[]
}

export function compareFantasyTeams(teams: FantasyTeam[]): FantasyTeam[] {
  return teams.sort((a, b) => b.totalPoints - a.totalPoints)
}

export function determineMatchResult(team1Points: number, team2Points: number): "win" | "loss" | "draw" {
  if (team1Points > team2Points) return "win"
  if (team1Points < team2Points) return "loss"
  return "draw"
}

export function calculateDailyFantasyResults(
  userTeams: FantasyTeam[],
  matchPerformances: MatchPerformance[],
  matchResults: { matchId: number; team1Won: boolean }[],
): FantasyTeam[] {
  return userTeams.map((team) => {
    const playerPoints = team.players.map((playerId) => {
      const performance = matchPerformances.find((p) => p.playerId === playerId)

      if (!performance) {
        // Нужно получить информацию о тире игрока из базы данных
        // Пока используем средние очки Tier2
        const averagePoints = getAveragePointsForNonPlaying("Tier2", true)

        return {
          playerId,
          totalPoints: averagePoints,
          breakdown: {
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            adr: 0,
            rating: averagePoints, // средние очки идут в рейтинг
            kast: 0,
            firstKills: 0,
            firstDeaths: 0,
            clutches: 0,
            multiKills: 0,
            utility: 0,
            mvp: 0,
          },
        }
      }

      const matchResult = matchResults.find((r) => r.matchId === performance.matchId)
      const teamWon = matchResult?.team1Won ?? false

      return calculateFantasyPoints(performance, teamWon)
    })

    const totalPoints = playerPoints.reduce((sum, p) => sum + p.totalPoints, 0)

    return {
      ...team,
      playerPoints,
      totalPoints: Math.round(totalPoints * 100) / 100,
    }
  })
}

export function determineLeagueResults(
  teams: FantasyTeam[],
): { userId: string; result: "win" | "draw" | "loss"; points: number }[] {
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints)

  return sortedTeams.map((team, index) => {
    let result: "win" | "draw" | "loss" = "loss"
    let leaguePoints = 0

    if (index === 0) {
      // Проверяем, есть ли ничья с первым местом
      const samePointsCount = sortedTeams.filter((t) => t.totalPoints === team.totalPoints).length
      if (samePointsCount > 1) {
        result = "draw"
        leaguePoints = 1
      } else {
        result = "win"
        leaguePoints = 3
      }
    } else {
      // Проверяем ничью с предыдущими командами
      const samePointsCount = sortedTeams.filter((t) => t.totalPoints === team.totalPoints).length
      if (samePointsCount > 1) {
        result = "draw"
        leaguePoints = 1
      } else {
        result = "loss"
        leaguePoints = 0
      }
    }

    return {
      userId: team.userId,
      result,
      points: leaguePoints,
    }
  })
}
