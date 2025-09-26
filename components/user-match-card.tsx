"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CalendarIcon, SwordsIcon, TrophyIcon, ClockIcon } from "./icons"
import { useLanguage } from "@/contexts/language-context"
import type { UserMatch, LeagueUser } from "@/types/player"
import { MatchDetailModal } from "./match-detail-modal"
import { useState } from "react"

interface UserMatchCardProps {
  match: UserMatch
  currentUser: LeagueUser
}

export function UserMatchCard({ match, currentUser }: UserMatchCardProps) {
  const { t, language } = useLanguage()
  const [showDetailModal, setShowDetailModal] = useState(false)

  const getStatusColor = (status: UserMatch["status"]) => {
    switch (status) {
      case "live":
        return "text-red-400 border-red-400/20 bg-red-400/10"
      case "upcoming":
        return "text-yellow-400 border-yellow-400/20 bg-yellow-400/10"
      case "completed":
        return "text-neon-green border-neon-green/20 bg-neon-green/10"
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : language === "ua" ? "uk-UA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card
        className="bg-card/50 border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={currentUser.teamLogo || "/placeholder.svg?height=32&width=32"}
                    alt={currentUser.teamName}
                  />
                  <AvatarFallback className="text-xs">{currentUser.teamName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-neon-blue">{currentUser.teamName}</div>
                  <div className="text-xs text-muted-foreground">{currentUser.username}</div>
                </div>
              </div>

              <SwordsIcon className="w-5 h-5 text-red-400" />

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={match.opponent.teamLogo || "/placeholder.svg?height=32&width=32"}
                    alt={match.opponent.teamName}
                  />
                  <AvatarFallback className="text-xs">
                    {match.opponent.teamName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{match.opponent.teamName}</div>
                  <div className="text-xs text-muted-foreground">{match.opponent.username}</div>
                </div>
              </div>
            </CardTitle>

            <Badge variant="outline" className={getStatusColor(match.status)}>
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
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Match Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(match.scheduledDate)}</span>
          </div>

          {/* Score Display */}
          {match.status === "completed" && match.userPoints !== undefined && match.opponentPoints !== undefined ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-8 text-2xl font-bold">
                <div className="text-center">
                  <div
                    className={
                      match.result === "win"
                        ? "text-neon-green"
                        : match.result === "loss"
                          ? "text-red-400"
                          : "text-yellow-400"
                    }
                  >
                    {match.userPoints}
                  </div>
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

              {/* Result Badge */}
              <div className="text-center">
                <Badge
                  className={`${
                    match.result === "win"
                      ? "bg-neon-green/20 text-neon-green"
                      : match.result === "loss"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-400/20 text-yellow-400"
                  }`}
                >
                  {match.result === "win"
                    ? `${t.victory} (+${match.pointsAwarded} ${language === "en" ? "pts" : language === "ru" ? "очк" : "очк"})`
                    : match.result === "loss"
                      ? t.defeat
                      : `${t.draw} (+${match.pointsAwarded} ${language === "en" ? "pt" : language === "ru" ? "очк" : "очк"})`}
                </Badge>
              </div>
            </div>
          ) : match.status === "live" ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">
                  {language === "en" ? "Match in progress..." : language === "ru" ? "Матч идет..." : "Матч триває..."}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {language === "en"
                  ? "Fantasy points are being calculated"
                  : language === "ru"
                    ? "Фэнтези очки подсчитываются"
                    : "Фентезі очки підраховуються"}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <ClockIcon className="w-4 h-4" />
                <span className="font-medium">
                  {language === "en"
                    ? "Awaiting match start"
                    : language === "ru"
                      ? "Ожидание начала матча"
                      : "Очікування початку матчу"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {language === "en"
                  ? "Make sure your team is ready!"
                  : language === "ru"
                    ? "Убедитесь, что ваша команда готова!"
                    : "Переконайтеся, що ваша команда готова!"}
              </div>
            </div>
          )}

          {/* League Context */}
          <div className="flex items-center justify-between text-sm bg-background/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-muted-foreground">
                {language === "en" ? "League Match" : language === "ru" ? "Матч лиги" : "Матч ліги"}
              </span>
            </div>
            <Badge
              className={`${
                currentUser.currentLeague === "A"
                  ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                  : currentUser.currentLeague === "B"
                    ? "text-blue-400 border-blue-400/30 bg-blue-400/10"
                    : "text-green-400 border-green-400/30 bg-green-400/10"
              }`}
            >
              {t[`league${currentUser.currentLeague}` as keyof typeof t]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={match}
        currentUser={currentUser}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  )
}
