export interface Player {
  id: string
  nickname: string
  realName: string
  photo: string
  role: PlayerRole
  tier: PlayerTier
  price: number
  team: string
  teamLogo: string
  stats: PlayerStats
  hltvId?: number // HLTV player ID for API integration
  country?: string // Player country code
}

export type PlayerRole = "AWP" | "Entry" | "Rifler" | "Support" | "IGL"

export type PlayerTier = "Tier1" | "Tier2" | "Tier3"

export interface PlayerStats {
  rating: number // Старый рейтинг 2.0
  rating30: number // Новый рейтинг 3.0
  kd: number
  adr: number
  matches: number
  // Дополнительные метрики для рейтинга 3.0
  kast: number // Kill, Assist, Survive, Trade percentage
  impact: number // Impact rating
  openingKills: number // Количество opening kills
  openingDeaths: number // Количество opening deaths
  clutchSuccess: number // Процент успешных клатчей
  multiKillRounds: number // Раунды с мультикиллами
  utilityDamage: number // Урон от гранат
  enemiesFlashed: number // Ослеплённые враги
  flashAssists: number // Ассисты от флешек
  supportRounds: number // Раунды поддержки
  awpKillsPerRound: number // AWP киллы за раунд (для AWPеров)
  entrySuccess: number // Успешность входов (для Entry фрагеров)
  tradingSuccess: number // Успешность трейдов
  clutchAttempts: number // Попытки к��атчей
  firstKillsInRound: number // Первые киллы в раунде
  survivalRate: number // Процент выживания
}

export interface TeamSlot {
  role: PlayerRole
  player: Player | null
}

export type TeamType = "main" | "reserve"

export interface TeamComposition {
  type: TeamType
  slots: TeamSlot[]
}

export interface Match {
  opponent: string
  result: "W" | "L"
  score: string
  rating: number
  kills: number
  deaths: number
}

export interface FantasyMatch {
  id: string
  hltvMatchId: number
  leagueId: string
  startTime: string
  status: "upcoming" | "live" | "finished"
  teams: {
    team1: string
    team2: string
  }
  playerStats?: FantasyPlayerStats[]
}

export interface FantasyPlayerStats {
  playerId: string
  hltvPlayerId: number
  matchId: string
  kills: number
  deaths: number
  assists: number
  rating: number
  adr: number
  fantasyPoints: number
}

export interface League {
  id: string
  name: string
  status: "active" | "completed" | "upcoming"
  participants: number
  prize: string
  startDate: string
  endDate: string
}

export interface LeagueStandings {
  userId: string
  username: string
  totalPoints: number
  matches: number
  wins: number
  draws: number
  losses: number
}

export interface LeagueUser {
  id: string
  username: string
  teamName: string
  teamLogo?: string // добавил логотип пользовательской команды
  currentLeague: LeagueTier
  leaguePoints: number
  wins: number
  losses: number
  draws: number
  fantasyTeam: Player[]
  totalFantasyPoints: number
  matchHistory: UserMatch[]
}

export type LeagueTier = "A" | "B" | "C"

export interface UserMatch {
  id: string
  opponent: LeagueUser
  status: "upcoming" | "live" | "completed"
  scheduledDate: string
  result?: "win" | "loss" | "draw"
  userPoints?: number
  opponentPoints?: number
  pointsAwarded?: number // +3 за победу, +1 за ничью, 0 за поражение
  userTeam?: Player[] // добавил составы команд для детального просмотра
  opponentTeam?: Player[]
  playerPerformances?: MatchPlayerPerformance[] // добавил индивидуальные выступления игроков
}

export interface MatchPlayerPerformance {
  playerId: string
  playerNickname: string
  playerPhoto: string
  ownerUsername: string
  ownerTeamLogo?: string
  fantasyPoints: number
  realMatchStats: {
    kills: number
    deaths: number
    assists: number
    rating: number
    adr: number
  }
}

export interface LeagueTable {
  tier: LeagueTier
  users: LeagueUser[]
  maxParticipants: number
  currentRound: number
  totalRounds: number
  status: "active" | "completed" | "upcoming"
  promotionSpots: number // Количество мест для повышения
  relegationSpots: number // Количество мест для понижения
}

export interface SuperCup {
  id: string
  participants: LeagueUser[] // Топ-2 из каждой лиги
  status: "upcoming" | "active" | "completed"
  matches: SuperCupMatch[]
  winner?: LeagueUser
  prizes: {
    first: string
    second: string
    third: string
  }
}

export interface SuperCupMatch {
  id: string
  round: "semifinal" | "final" | "third-place"
  user1: LeagueUser
  user2: LeagueUser
  status: "upcoming" | "live" | "completed"
  result?: {
    winner: LeagueUser
    user1Points: number
    user2Points: number
  }
}
