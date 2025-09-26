"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SwordsIcon } from "./icons"
import { useLanguage } from "@/contexts/language-context"
import type { UserMatch, LeagueUser } from "@/types/player"
import Image from "next/image"

interface MatchDetailModalProps {
  match: UserMatch | null
  currentUser: LeagueUser
  isOpen: boolean
  onClose: () => void
}

export function MatchDetailModal({ match, currentUser, isOpen, onClose }: MatchDetailModalProps) {
  const { t, language } = useLanguage()

  if (!match) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : language === "ua" ? "uk-UA" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getResultColor = (result?: "win" | "loss" | "draw") => {
    switch (result) {
      case "win":
        return "text-neon-green"
      case "loss":
        return "text-red-400"
      case "draw":
        return "text-yellow-400"
      default:
        return "text-muted-foreground"
    }
  }

  // Mock data для демонстрации
  const mockUserTeam = [
    { id: "1", nickname: "s1mple", photo: "/s1mple-cs2-player.jpg", role: "AWP", fantasyPoints: 25.4 },
    { id: "2", nickname: "ZywOo", photo: "/zywoo-cs2-player.jpg", role: "AWP", fantasyPoints: 23.8 },
    { id: "3", nickname: "sh1ro", photo: "/sh1ro-cs2-player.jpg", role: "Rifler", fantasyPoints: 18.2 },
    { id: "4", nickname: "Ax1Le", photo: "/ax1le-cs2-player.jpg", role: "Entry", fantasyPoints: 16.7 },
    { id: "5", nickname: "HObbit", photo: "/hobbit-cs2-player.jpg", role: "Support", fantasyPoints: 14.3 },
  ]

  const mockOpponentTeam = [
    { id: "6", nickname: "donk", photo: "/donk-cs2-player.jpg", role: "Entry", fantasyPoints: 22.1 },
    { id: "7", nickname: "magixx", photo: "/magixx-cs2-player.jpg", role: "AWP", fantasyPoints: 19.5 },
    { id: "8", nickname: "chopper", photo: "/chopper-cs2-player.jpg", role: "IGL", fantasyPoints: 17.8 },
    { id: "9", nickname: "zont1x", photo: "/zont1x-cs2-player.jpg", role: "Rifler", fantasyPoints: 15.9 },
    { id: "10", nickname: "Patsi", photo: "/patsi-cs2-player.jpg", role: "Support", fantasyPoints: 13.2 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser.teamLogo || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{currentUser.teamName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-neon-blue">{currentUser.teamName}</div>
                  <div className="text-xs text-muted-foreground">{currentUser.username}</div>
                </div>
              </div>

              <SwordsIcon className="w-5 h-5 text-red-400" />

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={match.opponent.teamLogo || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{match.opponent.teamName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{match.opponent.teamName}</div>
                  <div className="text-xs text-muted-foreground">{match.opponent.username}</div>
                </div>
              </div>
            </div>

            <Badge
              variant="outline"
              className={
                match.status === "live"
                  ? "text-red-400 border-red-400/20 bg-red-400/10"
                  : match.status === "upcoming"
                    ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/10"
                    : "text-neon-green border-neon-green/20 bg-neon-green/10"
              }
            >
              {match.status === "live"
                ? language === "en"
                  ? "LIVE"
                  : language === "ru"
                    ? "В ЭФИРЕ"
                    : "В ЕФІРІ"
                : match.status === "upcoming"
                  ? language === "en"
                    ? "Upcoming"
                    : language === "ru"
                      ? "Предстоящий"
                      : "Майбутній"
                  : language === "en"
                    ? "Completed"
                    : language === "ru"
                      ? "Завершен"
                      : "Завершений"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {language === "en"
                  ? "Match Information"
                  : language === "ru"
                    ? "Информация о матче"
                    : "Інформація про матч"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">{formatDate(match.scheduledDate)}</div>

              {match.status === "completed" && match.userPoints !== undefined && match.opponentPoints !== undefined ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-8 text-3xl font-bold">
                    <div className="text-center">
                      <div className={getResultColor(match.result)}>{match.userPoints}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {language === "en" ? "points" : language === "ru" ? "очков" : "очок"}
                      </div>
                    </div>
                    <div className="text-muted-foreground">-</div>
                    <div className="text-center">
                      <div
                        className={
                          match.result === "loss"
                            ? "text-neon-green"
                            : match.result === "win"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }
                      >
                        {match.opponentPoints}
                      </div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {language === "en" ? "points" : language === "ru" ? "очков" : "очок"}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Badge
                      className={
                        match.result === "win"
                          ? "bg-neon-green/20 text-neon-green"
                          : match.result === "loss"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-400/20 text-yellow-400"
                      }
                    >
                      {match.result === "win"
                        ? `${t.victory} (+${match.pointsAwarded} ${language === "en" ? "pts" : language === "ru" ? "очк" : "очк"})`
                        : match.result === "loss"
                          ? t.defeat
                          : `${t.draw} (+${match.pointsAwarded} ${language === "en" ? "pt" : language === "ru" ? "очк" : "очк"})`}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-muted-foreground">
                    {match.status === "live"
                      ? language === "en"
                        ? "Match in progress - Fantasy points are being calculated"
                        : language === "ru"
                          ? "Матч идет - Фэнтези очки подсчитываются"
                          : "Матч триває - Фентезі очки підраховуються"
                      : language === "en"
                        ? "Awaiting match start"
                        : language === "ru"
                          ? "Ожидание начала матча"
                          : "Очікування початку матчу"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Compositions */}
          <Tabs defaultValue="lineups" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lineups">
                {language === "en" ? "Team Lineups" : language === "ru" ? "Составы команд" : "Склади команд"}
              </TabsTrigger>
              <TabsTrigger value="performance">
                {language === "en"
                  ? "Player Performance"
                  : language === "ru"
                    ? "Выступления игроков"
                    : "Виступи гравців"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lineups" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* User Team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={currentUser.teamLogo || "/placeholder.svg?height=24&width=24"} />
                        <AvatarFallback className="text-xs">
                          {currentUser.teamName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {currentUser.teamName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockUserTeam.map((player, index) => (
                      <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 relative">
                        {/* Owner Logo Background */}
                        {currentUser.teamLogo && (
                          <div className="absolute inset-0 opacity-10 rounded-lg overflow-hidden">
                            <Image
                              src={currentUser.teamLogo || "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={player.photo || "/placeholder.svg"}
                            alt={player.nickname}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 relative z-10">
                          <div className="font-semibold">{player.nickname}</div>
                          <div className="text-xs text-muted-foreground">{player.role}</div>
                        </div>
                        <div className="text-right relative z-10">
                          <div className="font-bold text-neon-green">{player.fantasyPoints}</div>
                          <div className="text-xs text-muted-foreground">
                            {language === "en" ? "pts" : language === "ru" ? "очк" : "очк"}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>{language === "en" ? "Total:" : language === "ru" ? "Итого:" : "Всього:"}</span>
                        <span className="text-neon-green">{match.userPoints || 98.4}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opponent Team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={match.opponent.teamLogo || "/placeholder.svg?height=24&width=24"} />
                        <AvatarFallback className="text-xs">
                          {match.opponent.teamName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {match.opponent.teamName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockOpponentTeam.map((player, index) => (
                      <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 relative">
                        {/* Owner Logo Background */}
                        {match.opponent.teamLogo && (
                          <div className="absolute inset-0 opacity-10 rounded-lg overflow-hidden">
                            <Image
                              src={match.opponent.teamLogo || "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={player.photo || "/placeholder.svg"}
                            alt={player.nickname}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 relative z-10">
                          <div className="font-semibold">{player.nickname}</div>
                          <div className="text-xs text-muted-foreground">{player.role}</div>
                        </div>
                        <div className="text-right relative z-10">
                          <div className="font-bold text-neon-green">{player.fantasyPoints}</div>
                          <div className="text-xs text-muted-foreground">
                            {language === "en" ? "pts" : language === "ru" ? "очк" : "очк"}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>{language === "en" ? "Total:" : language === "ru" ? "Итого:" : "Всього:"}</span>
                        <span className="text-neon-green">{match.opponentPoints || 88.5}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="text-center text-muted-foreground">
                {language === "en"
                  ? "Detailed player performance statistics will be available here"
                  : language === "ru"
                    ? "Здесь будет доступна подробная статистика выступлений игроков"
                    : "Тут буде доступна детальна статистика виступів гравців"}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
