"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrophyIcon, UsersIcon, CalendarIcon, SwordsIcon } from "./icons"
import { useLanguage } from "@/contexts/language-context"

interface Tournament {
  id: string
  name: string
  status: "active" | "upcoming" | "completed"
  participants: number
  prize: string
  startDate: string
  endDate: string
  currentRound: number
  totalRounds: number
  matches: Match[]
}

interface Match {
  id: string
  player1: string
  player2: string
  player1Team: string
  player2Team: string
  status: "live" | "upcoming" | "completed"
  score?: { player1: number; player2: number }
  playerStats?: PlayerMatchStats[]
}

interface PlayerMatchStats {
  playerId: string
  name: string
  team: string
  kills: number
  deaths: number
  assists: number
  adr: number
  rating: number
  kast: number
  headshots: number
  firstKills: number
  clutchesWon: number
  multiKills: number
  fantasyPoints: number
}

const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Major Championship",
    status: "active",
    participants: 64,
    prize: "100,000 Credits",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    currentRound: 3,
    totalRounds: 6,
    matches: [
      {
        id: "match-1",
        player1: "ProGamer2024",
        player2: "CS2Master",
        player1Team: "Elite Squad",
        player2Team: "Tactical Legends",
        status: "live",
        score: { player1: 847, player2: 823 },
        playerStats: [
          {
            playerId: "s1mple",
            name: "s1mple",
            team: "Elite Squad",
            kills: 23,
            deaths: 14,
            assists: 7,
            adr: 93,
            rating: 1.47,
            kast: 88,
            headshots: 48,
            firstKills: 5,
            clutchesWon: 2,
            multiKills: 1,
            fantasyPoints: 65,
          },
          {
            playerId: "zywoo",
            name: "ZywOo",
            team: "Tactical Legends",
            kills: 25,
            deaths: 13,
            assists: 6,
            adr: 95,
            rating: 1.52,
            kast: 89,
            headshots: 52,
            firstKills: 6,
            clutchesWon: 3,
            multiKills: 2,
            fantasyPoints: 72,
          },
        ],
      },
      {
        id: "match-2",
        player1: "FragHunter",
        player2: "StrategyKing",
        player1Team: "Headshot Heroes",
        player2Team: "Smart Plays",
        status: "upcoming",
        score: { player1: 798, player2: 776 },
      },
    ],
  },
  {
    id: "2",
    name: "Weekly Cup",
    status: "active",
    participants: 32,
    prize: "25,000 Credits",
    startDate: "2024-01-22",
    endDate: "2024-01-29",
    currentRound: 2,
    totalRounds: 5,
    matches: [
      {
        id: "match-3",
        player1: "ClutchMaster",
        player2: "AimBot2024",
        player1Team: "Pressure Kings",
        player2Team: "Precision Force",
        status: "completed",
        score: { player1: 754, player2: 732 },
      },
    ],
  },
]

function calculateTotalFantasyPoints(stats: PlayerMatchStats[]): number {
  return stats.reduce((total, player) => total + player.fantasyPoints, 0)
}

export function TournamentDashboard() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament>(mockTournaments[0])
  const { t } = useLanguage()

  const liveMatches = selectedTournament.matches.filter((match) => match.status === "live")
  const upcomingMatches = selectedTournament.matches.filter((match) => match.status === "upcoming")
  const completedMatches = selectedTournament.matches.filter((match) => match.status === "completed")

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tournament Header */}
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">Турниры и Лиги</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Соревнуйтесь с другими игроками в реальном времени
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-neon-green">2,450</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Ваши очки</div>
            </div>
          </div>
        </div>

        {/* Tournament Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mockTournaments.map((tournament) => (
            <Button
              key={tournament.id}
              variant={selectedTournament.id === tournament.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTournament(tournament)}
              className={`${
                selectedTournament.id === tournament.id
                  ? "bg-neon-blue text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tournament.name}
              <Badge
                variant="outline"
                className={`ml-2 text-xs ${
                  tournament.status === "active"
                    ? "text-neon-green border-neon-green/20"
                    : "text-yellow-400 border-yellow-400/20"
                }`}
              >
                {tournament.status}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Tournament Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">{selectedTournament.participants}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Участников</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">{selectedTournament.prize}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Призовой фонд</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">
              Раунд {selectedTournament.currentRound}/{selectedTournament.totalRounds}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Прогресс</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
            <SwordsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mx-auto mb-2" />
            <div className="text-base sm:text-lg font-bold">{liveMatches.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Активных матчей</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 h-11 sm:h-10">
          <TabsTrigger
            value="live"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-sm sm:text-base"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
            Живые матчи ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-neon-blue data-[state=active]:text-black text-sm sm:text-base"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Предстоящие ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-sm sm:text-base"
          >
            <TrophyIcon className="w-4 h-4 mr-2" />
            Завершенные ({completedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {liveMatches.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">Нет активных матчей</div>
              </CardContent>
            </Card>
          ) : (
            liveMatches.map((match) => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">Нет предстоящих матчей</div>
              </CardContent>
            </Card>
          ) : (
            upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedMatches.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">Нет завершенных матчей</div>
              </CardContent>
            </Card>
          ) : (
            completedMatches.map((match) => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const [showStats, setShowStats] = useState(false)

  return (
    <Card className="bg-card/50 border-border/50 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold">{match.player1}</span>
              <Badge variant="outline" className="text-xs">
                {match.player1Team}
              </Badge>
            </div>
            <SwordsIcon className="w-5 h-5 text-red-400" />
            <div className="flex items-center gap-2">
              <span className="font-bold">{match.player2}</span>
              <Badge variant="outline" className="text-xs">
                {match.player2Team}
              </Badge>
            </div>
          </CardTitle>
          <Badge
            variant="outline"
            className={`${
              match.status === "live"
                ? "text-red-400 border-red-400/20 bg-red-400/10"
                : match.status === "upcoming"
                  ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/10"
                  : "text-neon-green border-neon-green/20 bg-neon-green/10"
            }`}
          >
            {match.status === "live" ? "В ЭФИРЕ" : match.status === "upcoming" ? "Скоро" : "Завершен"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {match.score && (
          <div className="flex items-center justify-center gap-8 text-2xl font-bold">
            <div className="text-center">
              <div className="text-neon-blue">{match.score.player1}</div>
              <div className="text-xs text-muted-foreground font-normal">очков</div>
            </div>
            <div className="text-muted-foreground">-</div>
            <div className="text-center">
              <div className="text-neon-green">{match.score.player2}</div>
              <div className="text-xs text-muted-foreground font-normal">очков</div>
            </div>
          </div>
        )}

        {match.playerStats && match.playerStats.length > 0 && (
          <div className="space-y-3">
            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="w-full">
              {showStats ? "Скрыть статистику" : "Показать статистику игроков"}
            </Button>

            {showStats && (
              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="text-sm font-medium text-center text-muted-foreground">
                  Индивидуальная статистика игроков
                </div>
                {match.playerStats.map((player, index) => (
                  <div key={player.playerId} className="bg-background/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`${
                            player.team === match.player1Team
                              ? "text-neon-blue border-neon-blue/20"
                              : "text-neon-green border-neon-green/20"
                          }`}
                        >
                          {player.team}
                        </Badge>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-400">{player.fantasyPoints} очков</div>
                        <div className="text-xs text-muted-foreground">Рейтинг: {player.rating.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-neon-green">{player.kills}</div>
                        <div className="text-muted-foreground">Убийства</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-400">{player.deaths}</div>
                        <div className="text-muted-foreground">Смерти</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-neon-blue">{player.assists}</div>
                        <div className="text-muted-foreground">Помощи</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-400">{player.adr}</div>
                        <div className="text-muted-foreground">ADR</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-semibold">{player.headshots}%</div>
                        <div className="text-muted-foreground">Хедшоты</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{player.firstKills}</div>
                        <div className="text-muted-foreground">Первые убийства</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{player.clutchesWon}</div>
                        <div className="text-muted-foreground">Клатчи</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{player.multiKills}</div>
                        <div className="text-muted-foreground">Мульти-киллы</div>
                      </div>
                    </div>

                    {/* Breakdown of fantasy points */}
                    <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-lg p-3 mt-3">
                      <div className="text-xs font-medium text-neon-blue mb-2">Расчет очков для {player.name}:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          • Убийства: {player.kills} × 2 = {player.kills * 2} очков
                        </div>
                        <div>
                          • Смерти: {player.deaths} × (-1) = {player.deaths * -1} очков
                        </div>
                        <div>
                          • Помощи: {player.assists} × 1 = {player.assists} очков
                        </div>
                        <div>• Рейтинг бонус: {((player.rating - 1.0) * 10).toFixed(1)} очков</div>
                        <div>• ADR бонус: {(player.adr * 0.1).toFixed(1)} очков</div>
                        <div className="col-span-2 font-semibold text-yellow-400 border-t border-border/50 pt-2 mt-2">
                          Итого: {player.fantasyPoints} очков
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
