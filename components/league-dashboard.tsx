"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrophyIcon,
  MedalIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  AwardIcon,
  CrownIcon,
  StarIcon,
  SwordsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShieldIcon,
  EditIcon,
} from "./icons"
import { useLanguage } from "@/contexts/language-context"
import type { LeagueUser, LeagueTier, LeagueTable, SuperCup } from "@/types/player"
import { UserMatchCard } from "./user-match-card"
import { TeamSettingsModal } from "./team-settings-modal"

const mockCurrentUser: LeagueUser = {
  id: "user-1",
  username: "ProGamer2024",
  teamName: "Elite Squad",
  teamLogo: "/elite-squad-logo.jpg", // добавил логотип команды
  currentLeague: "B",
  leaguePoints: 15, // 5 побед * 3 очка
  wins: 5,
  losses: 2,
  draws: 1,
  fantasyTeam: [],
  totalFantasyPoints: 847,
  matchHistory: [
    {
      id: "match-1",
      opponent: {
        id: "user-b2",
        username: "StratMaster",
        teamName: "Tactical Legends",
        teamLogo: "/tactical-legends-logo.jpg", // добавил логотип команды
        currentLeague: "B",
        leaguePoints: 18,
        wins: 6,
        losses: 1,
        draws: 0,
        fantasyTeam: [],
        totalFantasyPoints: 923,
        matchHistory: [],
      },
      status: "upcoming",
      scheduledDate: "2024-01-25T19:00:00Z",
    },
    {
      id: "match-2",
      opponent: {
        id: "user-b3",
        username: "FragHunter",
        teamName: "Headshot Heroes",
        teamLogo: "/headshot-heroes-logo.jpg", // добавил логотип команды
        currentLeague: "B",
        leaguePoints: 12,
        wins: 4,
        losses: 3,
        draws: 0,
        fantasyTeam: [],
        totalFantasyPoints: 798,
        matchHistory: [],
      },
      status: "completed",
      scheduledDate: "2024-01-22T18:00:00Z",
      result: "win",
      userPoints: 847,
      opponentPoints: 798,
      pointsAwarded: 3,
    },
  ],
}

const mockLeagueTables: LeagueTable[] = [
  {
    tier: "A",
    users: [
      {
        id: "user-a1",
        username: "CS2Legend",
        teamName: "Tactical Masters",
        teamLogo: "/placeholder.svg?key=abc123", // добавил логотип команды
        currentLeague: "A",
        leaguePoints: 21,
        wins: 7,
        losses: 1,
        draws: 0,
        fantasyTeam: [],
        totalFantasyPoints: 1245,
        matchHistory: [],
      },
      {
        id: "user-a2",
        username: "FragKing",
        teamName: "Headshot Heroes",
        teamLogo: "/placeholder.svg?key=def456", // добавил логотип команды
        currentLeague: "A",
        leaguePoints: 18,
        wins: 6,
        losses: 2,
        draws: 0,
        fantasyTeam: [],
        totalFantasyPoints: 1198,
        matchHistory: [],
      },
      // ... еще 6-18 пользователей
    ],
    maxParticipants: 16,
    currentRound: 8,
    totalRounds: 15,
    status: "active",
    promotionSpots: 0, // Лига А не повышается
    relegationSpots: 3,
  },
  {
    tier: "B",
    users: [
      mockCurrentUser,
      {
        id: "user-b2",
        username: "StratMaster",
        teamName: "Tactical Legends",
        teamLogo: "/placeholder.svg?key=ghi789", // добавил логотип команды
        currentLeague: "B",
        leaguePoints: 18,
        wins: 6,
        losses: 1,
        draws: 0,
        fantasyTeam: [],
        totalFantasyPoints: 923,
        matchHistory: [],
      },
      // ... еще пользователей
    ],
    maxParticipants: 16,
    currentRound: 8,
    totalRounds: 15,
    status: "active",
    promotionSpots: 3,
    relegationSpots: 3,
  },
  {
    tier: "C",
    users: [
      {
        id: "user-c1",
        username: "NewPlayer",
        teamName: "Rising Stars",
        teamLogo: "/placeholder.svg?key=jkl012", // добавил логотип команды
        currentLeague: "C",
        leaguePoints: 12,
        wins: 4,
        losses: 3,
        draws: 0,
        fantasyTeam: [],
        totalFantasyPoints: 654,
        matchHistory: [],
      },
      // ... еще пользователей
    ],
    maxParticipants: 20,
    currentRound: 7,
    totalRounds: 15,
    status: "active",
    promotionSpots: 3,
    relegationSpots: 0, // Лига С не понижается
  },
]

const mockSuperCup: SuperCup = {
  id: "supercup-2024",
  participants: [], // Топ-2 из каждой лиги
  status: "upcoming",
  matches: [],
  prizes: {
    first: "50,000 Credits + Champion Badge",
    second: "25,000 Credits + Runner-up Badge",
    third: "10,000 Credits + Bronze Badge",
  },
}

const getLeagueColor = (tier: LeagueTier) => {
  switch (tier) {
    case "A":
      return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
    case "B":
      return "text-blue-400 border-blue-400/30 bg-blue-400/10"
    case "C":
      return "text-green-400 border-green-400/30 bg-green-400/10"
  }
}

const getPositionStatus = (position: number, league: LeagueTable) => {
  if (league.tier === "A") {
    if (position <= 2) return { type: "supercup", icon: CrownIcon, color: "text-purple-400" }
    if (position >= league.users.length - 2) return { type: "relegation", icon: ArrowDownIcon, color: "text-red-400" }
  } else if (league.tier === "B") {
    if (position <= 2) return { type: "supercup", icon: CrownIcon, color: "text-purple-400" }
    if (position <= 3) return { type: "promotion", icon: ArrowUpIcon, color: "text-yellow-400" }
    if (position >= league.users.length - 2) return { type: "relegation", icon: ArrowDownIcon, color: "text-red-400" }
  } else {
    // League C
    if (position <= 2) return { type: "supercup", icon: CrownIcon, color: "text-purple-400" }
    if (position <= 3) return { type: "promotion", icon: ArrowUpIcon, color: "text-green-400" }
  }
  return { type: "safe", icon: ShieldIcon, color: "text-gray-400" }
}

export function LeagueDashboard() {
  const [selectedLeague, setSelectedLeague] = useState<LeagueTier>("B") // Лига текущего пользователя
  const [showTeamSettings, setShowTeamSettings] = useState(false) // добавил состояние для модального окна настроек команды
  const { t, language } = useLanguage()

  const currentLeague = mockLeagueTables.find((l) => l.tier === selectedLeague)!
  const userPosition = currentLeague.users.findIndex((u) => u.id === mockCurrentUser.id) + 1

  const upcomingMatches = mockCurrentUser.matchHistory.filter((m) => m.status === "upcoming")
  const liveMatches = mockCurrentUser.matchHistory.filter((m) => m.status === "live")
  const completedMatches = mockCurrentUser.matchHistory.filter((m) => m.status === "completed")

  const handleSaveTeamSettings = (teamName: string, teamLogo?: string) => {
    // В реальном приложении здесь будет API вызов
    console.log("Saving team settings:", { teamName, teamLogo })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* League Header */}
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">{t.leagueSystem}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {language === "en"
                ? "Compete in leagues and climb to the top"
                : language === "ru"
                  ? "Соревнуйтесь в лигах и поднимайтесь наверх"
                  : "Змагайтеся в лігах та піднімайтеся нагору"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTeamSettings(true)}
              className="flex items-center gap-2"
            >
              <EditIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === "en" ? "Team Settings" : language === "ru" ? "Настройки" : "Налаштування"}
              </span>
            </Button>
            <Badge className={`text-lg px-3 py-1 ${getLeagueColor(mockCurrentUser.currentLeague)}`}>
              {t[`league${mockCurrentUser.currentLeague}` as keyof typeof t]}
            </Badge>
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-neon-green">{mockCurrentUser.leaguePoints}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t.leaguePoints}</div>
            </div>
          </div>
        </div>

        {/* Current User Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">#{userPosition}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t.currentRank}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <AwardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">
              {mockCurrentUser.wins}-{mockCurrentUser.losses}-{mockCurrentUser.draws}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t.wldRecord}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">{mockCurrentUser.totalFantasyPoints}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t.fantasyPoints}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">
              {language === "en"
                ? `Round ${currentLeague.currentRound}/${currentLeague.totalRounds}`
                : language === "ru"
                  ? `Тур ${currentLeague.currentRound}/${currentLeague.totalRounds}`
                  : `Тур ${currentLeague.currentRound}/${currentLeague.totalRounds}`}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t.progress}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="my-matches" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 h-11 sm:h-10">
          <TabsTrigger
            value="my-matches"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm"
          >
            <SwordsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t.matchHistory}</span>
            <span className="sm:hidden">{language === "en" ? "Matches" : language === "ru" ? "Матчи" : "Матчі"}</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-league"
            className="data-[state=active]:bg-neon-blue data-[state=active]:text-black text-xs sm:text-sm"
          >
            <ShieldIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t.myLeague}</span>
            <span className="sm:hidden">{t.myLeague}</span>
          </TabsTrigger>
          <TabsTrigger
            value="all-leagues"
            className="data-[state=active]:bg-neon-blue data-[state=active]:text-black text-xs sm:text-sm"
          >
            <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t.leagues}</span>
            <span className="sm:hidden">{t.leagues}</span>
          </TabsTrigger>
          <TabsTrigger
            value="supercup"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-xs sm:text-sm"
          >
            <CrownIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t.superCup}</span>
            <span className="sm:hidden">{t.superCup}</span>
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="data-[state=active]:bg-neon-blue data-[state=active]:text-black text-xs sm:text-sm"
          >
            <TrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t.rules}</span>
            <span className="sm:hidden">{t.rules}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-matches" className="space-y-4">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 h-11 sm:h-10">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-sm sm:text-base"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {language === "en"
                  ? `Upcoming (${upcomingMatches.length})`
                  : language === "ru"
                    ? `Предстоящие (${upcomingMatches.length})`
                    : `Майбутні (${upcomingMatches.length})`}
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-sm sm:text-base"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                {language === "en"
                  ? `Live (${liveMatches.length})`
                  : language === "ru"
                    ? `Живые (${liveMatches.length})`
                    : `Живі (${liveMatches.length})`}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-sm sm:text-base"
              >
                <TrophyIcon className="w-4 h-4 mr-2" />
                {language === "en"
                  ? `Completed (${completedMatches.length})`
                  : language === "ru"
                    ? `Завершенные (${completedMatches.length})`
                    : `Завершені (${completedMatches.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingMatches.length === 0 ? (
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-muted-foreground">
                      {language === "en"
                        ? "No upcoming matches"
                        : language === "ru"
                          ? "Нет предстоящих матчей"
                          : "Немає майбутніх матчів"}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                upcomingMatches.map((match) => (
                  <UserMatchCard key={match.id} match={match} currentUser={mockCurrentUser} />
                ))
              )}
            </TabsContent>

            <TabsContent value="live" className="space-y-4">
              {liveMatches.length === 0 ? (
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-muted-foreground">
                      {language === "en"
                        ? "No live matches"
                        : language === "ru"
                          ? "Нет активных матчей"
                          : "Немає активних матчів"}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                liveMatches.map((match) => <UserMatchCard key={match.id} match={match} currentUser={mockCurrentUser} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedMatches.length === 0 ? (
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-muted-foreground">
                      {language === "en"
                        ? "No completed matches"
                        : language === "ru"
                          ? "Нет завершенных матчей"
                          : "Немає завершених матчів"}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                completedMatches.map((match) => (
                  <UserMatchCard key={match.id} match={match} currentUser={mockCurrentUser} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="my-league" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Badge className={`${getLeagueColor(selectedLeague)}`}>
                  {t[`league${selectedLeague}` as keyof typeof t]}
                </Badge>
                <span className="text-sm sm:text-base">{t.leagueTable}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentLeague.users
                  .sort((a, b) => b.leaguePoints - a.leaguePoints)
                  .map((user, index) => {
                    const position = index + 1
                    const status = getPositionStatus(position, currentLeague)
                    const isCurrentUser = user.id === mockCurrentUser.id

                    return (
                      <div
                        key={user.id}
                        className={`rounded-lg border border-border/50 p-4 transition-colors ${
                          isCurrentUser
                            ? "bg-gradient-to-r from-neon-blue/10 to-purple-500/10 border-neon-blue/30"
                            : "bg-background/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <status.icon className={`w-4 h-4 ${status.color}`} />
                              <Badge variant="outline" className="text-xs">
                                #{position}
                              </Badge>
                            </div>
                            <div>
                              <div className={`font-semibold text-base ${isCurrentUser ? "text-neon-blue" : ""}`}>
                                {user.username}
                                {isCurrentUser && (
                                  <Badge className="ml-2 text-xs bg-neon-blue/20 text-neon-blue">
                                    {language === "en" ? "You" : language === "ru" ? "Вы" : "Ви"}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.teamName}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-neon-green">{user.leaguePoints}</div>
                              <div className="text-muted-foreground">{t.leaguePoints}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-neon-blue">
                                {user.wins}-{user.losses}-{user.draws}
                              </div>
                              <div className="text-muted-foreground">{t.wld}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-yellow-400">{user.totalFantasyPoints}</div>
                              <div className="text-muted-foreground">{t.fantasyPoints}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-background/30 rounded-lg">
                <div className="text-sm font-medium mb-3">
                  {language === "en" ? "Position Zones:" : language === "ru" ? "Позиционные зоны:" : "Позиційні зони:"}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CrownIcon className="w-3 h-3 text-purple-400" />
                    <span>{t.qualifiedForSuperCup}</span>
                  </div>
                  {currentLeague.promotionSpots > 0 && (
                    <div className="flex items-center gap-2">
                      <ArrowUpIcon className="w-3 h-3 text-yellow-400" />
                      <span>{t.promotionZone}</span>
                    </div>
                  )}
                  {currentLeague.relegationSpots > 0 && (
                    <div className="flex items-center gap-2">
                      <ArrowDownIcon className="w-3 h-3 text-red-400" />
                      <span>{t.relegationZone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="w-3 h-3 text-gray-400" />
                    <span>{t.safeZone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-leagues" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {mockLeagueTables.map((league) => (
              <Card key={league.tier} className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <Badge className={`text-lg px-3 py-1 ${getLeagueColor(league.tier)}`}>
                      {t[`league${league.tier}` as keyof typeof t]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {league.users.length}/{league.maxParticipants}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {language === "en"
                      ? `Round ${league.currentRound}/${league.totalRounds}`
                      : language === "ru"
                        ? `Тур ${league.currentRound}/${league.totalRounds}`
                        : `Тур ${league.currentRound}/${league.totalRounds}`}
                  </div>

                  {/* Top 3 users */}
                  <div className="space-y-2">
                    {league.users
                      .sort((a, b) => b.leaguePoints - a.leaguePoints)
                      .slice(0, 3)
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <span className="font-bold text-neon-green">{user.leaguePoints}</span>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant={league.tier === selectedLeague ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedLeague(league.tier)}
                  >
                    {language === "en" ? "View League" : language === "ru" ? "Смотреть лигу" : "Дивитися лігу"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supercup" className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-500/10 to-yellow-400/10 border-purple-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CrownIcon className="w-6 h-6 text-yellow-400" />
                {t.superCup}
              </CardTitle>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Top 2 players from each league compete for the ultimate prize"
                  : language === "ru"
                    ? "Топ-2 игрока из каждой лиги соревнуются за главный приз"
                    : "Топ-2 гравці з кожної ліги змагаються за головний приз"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prizes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 text-center">
                  <CrownIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="font-bold text-yellow-400">{t.champion}</div>
                  <div className="text-sm text-muted-foreground">{mockSuperCup.prizes.first}</div>
                </div>
                <div className="bg-gray-300/10 border border-gray-300/30 rounded-lg p-4 text-center">
                  <MedalIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="font-bold text-gray-300">{t.runnerUp}</div>
                  <div className="text-sm text-muted-foreground">{mockSuperCup.prizes.second}</div>
                </div>
                <div className="bg-orange-400/10 border border-orange-400/30 rounded-lg p-4 text-center">
                  <AwardIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="font-bold text-orange-400">{t.bronze}</div>
                  <div className="text-sm text-muted-foreground">{mockSuperCup.prizes.third}</div>
                </div>
              </div>

              {/* Qualification Status */}
              <div className="bg-background/30 rounded-lg p-4">
                <div className="text-sm font-medium mb-3">
                  {language === "en"
                    ? "Qualification Status:"
                    : language === "ru"
                      ? "Статус квалификации:"
                      : "Статус кваліфікації:"}
                </div>
                <div className="space-y-2 text-sm">
                  {mockLeagueTables.map((league) => {
                    const topUsers = league.users.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 2)
                    return (
                      <div key={league.tier} className="flex items-center justify-between">
                        <Badge className={`${getLeagueColor(league.tier)}`}>
                          {t[`league${league.tier}` as keyof typeof t]}
                        </Badge>
                        <div className="text-right">
                          {topUsers.map((user, index) => (
                            <div key={user.id} className="text-xs">
                              #{index + 1} {user.username}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="text-center">
                <Badge className="bg-purple-500/20 text-purple-400 text-sm px-4 py-2">
                  {language === "en"
                    ? "Tournament starts after league completion"
                    : language === "ru"
                      ? "Турнир начнется после завершения лиг"
                      : "Турнір почнеться після завершення ліг"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <SwordsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  {language === "en" ? "Match System" : language === "ru" ? "Система матчей" : "Система матчів"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="text-sm">
                  {language === "en"
                    ? "• 1v1 matches between users with their fantasy teams"
                    : language === "ru"
                      ? "• Матчи 1 на 1 между пользователями с их фэнтези командами"
                      : "• Матчі 1 на 1 між користувачами з їх фентезі командами"}
                </div>
                <div className="text-sm">
                  {language === "en"
                    ? "• Winner determined by total fantasy points scored"
                    : language === "ru"
                      ? "• Победитель определяется по общим фэнтези очкам"
                      : "• Переможець визначається за загальними фентезі очками"}
                </div>
                <div className="text-sm">
                  {language === "en"
                    ? "• Matches scheduled on specific days"
                    : language === "ru"
                      ? "• Матчи назначаются на определенные дни"
                      : "• Матчі призначаються на певні дні"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                  {language === "en" ? "League Points" : language === "ru" ? "Очки лиги" : "Очки ліги"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.victory}</span>
                  <Badge className="bg-neon-green/20 text-neon-green text-xs">+3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.draw}</span>
                  <Badge className="bg-yellow-400/20 text-yellow-400 text-xs">+1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.defeat}</span>
                  <Badge className="bg-red-500/20 text-red-400 text-xs">0</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  {t.promotion} / {t.relegation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="text-sm">
                  {language === "en"
                    ? "• Top 3 in League B/C get promoted"
                    : language === "ru"
                      ? "• Топ-3 в Лиге Б/С получают повышение"
                      : "• Топ-3 в Лізі Б/С отримують підвищення"}
                </div>
                <div className="text-sm">
                  {language === "en"
                    ? "• Bottom 3 in League A/B get relegated"
                    : language === "ru"
                      ? "• Последние 3 в Лиге А/Б получают понижение"
                      : "• Останні 3 в Лізі А/Б отримують пониження"}
                </div>
                <div className="text-sm">
                  {language === "en"
                    ? "• League A winners qualify for Super Cup semifinals"
                    : language === "ru"
                      ? "• Победители Лиги А проходят в полуфинал Суперкубка"
                      : "• Переможці Ліги А проходять до півфіналу Суперкубка"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CrownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  {t.superCup}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="text-sm">
                  {language === "en"
                    ? "• Top 2 from each league qualify"
                    : language === "ru"
                      ? "• Топ-2 из каждой лиги проходят квалификацию"
                      : "• Топ-2 з кожної ліги проходять кваліфікацію"}
                </div>
                <div className="text-sm">
                  {language === "en"
                    ? "• Short tournament format with semifinals and final"
                    : language === "ru"
                      ? "• Короткий турнирный формат с полуфиналами и финалом"
                      : "• Короткий турнірний формат з півфіналами та фіналом"}
                </div>
                <div className="text-sm">
                  {language === "en"
                    ? "• Special badges and bonus credits for winners"
                    : language === "ru"
                      ? "• Специальные значки и бонусные кредиты для победителей"
                      : "• Спеціальні значки та бонусні кредити для переможців"}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <TeamSettingsModal
        user={mockCurrentUser}
        isOpen={showTeamSettings}
        onClose={() => setShowTeamSettings(false)}
        onSave={handleSaveTeamSettings}
      />
    </div>
  )
}
