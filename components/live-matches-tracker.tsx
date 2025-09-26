"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLiveMatches, useMatchStats } from "@/hooks/use-hltv-data"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/translations"
import type { CS2Match } from "@/lib/cs2-api-client"

function calculateFantasyPoints(player: any): number {
  if (!player) return 0

  const kills = player.kills || 0
  const deaths = player.deaths || 0
  const assists = player.assists || 0
  const rating = player.rating || 1.0
  const adr = player.adr || 0

  // Fantasy scoring system
  const killPoints = kills * 2
  const deathPenalty = deaths * -1
  const assistPoints = assists * 1
  const ratingBonus = (rating - 1.0) * 10
  const adrBonus = adr * 0.1

  return Math.round(killPoints + deathPenalty + assistPoints + ratingBonus + adrBonus)
}

export function LiveMatchesTracker() {
  const { language } = useLanguage()
  const { matches, loading, error, source } = useLiveMatches()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "liveMatches")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">{t(language, "loading")}...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "liveMatches")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-400">
            {t(language, "error")}: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {t(language, "liveMatches")}
          {source && (
            <Badge variant="outline" className="text-xs">
              {source}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!matches || matches.length === 0 ? (
          <div className="text-center text-muted-foreground">{t(language, "noLiveMatches")}</div>
        ) : (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </CardContent>
    </Card>
  )
}

function MatchCard({ match }: { match: CS2Match }) {
  const { language } = useLanguage()
  const { stats, loading: statsLoading, error: statsError } = useMatchStats(match.id)

  console.log("[v0] MatchCard stats:", stats)

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium">{match.teams.team1.name || "Team 1"}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-medium">{match.teams.team2.name || "Team 2"}</span>
        </div>
        <Badge variant={match.status === "live" ? "destructive" : "secondary"}>
          {match.status === "live" ? t(language, "live") : match.status}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">{match.tournament || "Professional Match"}</div>

      {match.score && (
        <div className="flex items-center justify-center gap-4 text-lg font-bold">
          <span>
            {match.score.team1} - {match.score.team2}
          </span>
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">Format: {match.format}</div>

      {statsLoading && (
        <div className="text-sm text-muted-foreground text-center">{t(language, "loading")} stats...</div>
      )}

      {statsError && <div className="text-sm text-red-400 text-center">Stats error: {statsError}</div>}

      {stats && Array.isArray(stats) && stats.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">{t(language, "topPerformers")}:</div>
          <div className="grid grid-cols-1 gap-2">
            {stats.slice(0, 3).map((player, index) => (
              <div key={player.playerId || index} className="flex items-center justify-between text-sm">
                <span>{player.name || `Player ${index + 1}`}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">{player.kills || 0}K</span>
                  <span className="text-red-400">{player.deaths || 0}D</span>
                  <span className="text-neon-blue font-medium">
                    {player.fantasyPoints || calculateFantasyPoints(player)} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && (!Array.isArray(stats) || stats.length === 0) && (
        <div className="text-sm text-muted-foreground text-center">No player stats available</div>
      )}
    </div>
  )
}
