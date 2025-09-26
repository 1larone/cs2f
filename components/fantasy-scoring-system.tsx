"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/translations"
import { calculateFantasyPoints, type MatchPerformance } from "@/lib/fantasy-scoring"
import { useState } from "react"
import { ChevronDownIcon, TrophyIcon, TargetIcon, ZapIcon } from "@/components/icons"

interface FantasyScoringProps {
  matchStats?: Array<{
    playerId: number
    nickname: string
    kills: number
    deaths: number
    assists: number
    rating: number
    adr: number
    headshots?: number
    firstKills?: number
    firstDeaths?: number
    clutchesWon?: number
    multiKills?: number
    utilityDamage?: number
    flashAssists?: number
    mvpRounds?: number
    kast?: number
    playerRole?: "AWP" | "Entry" | "Rifler" | "Support" | "IGL"
    playerTier?: "Tier1" | "Tier2" | "Tier3"
    teamWon?: boolean
  }>
}

export function FantasyScoringSystem({ matchStats }: FantasyScoringProps) {
  const { language } = useLanguage()
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null)

  if (!matchStats || matchStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t(language, "fantasyScoring")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">{t(language, "noLiveMatches")}</div>
        </CardContent>
      </Card>
    )
  }

  const playersWithPoints = matchStats
    .map((player) => {
      const performance: MatchPerformance = {
        playerId: player.playerId,
        matchId: 1, // Mock match ID
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        headshots: player.headshots || Math.floor(player.kills * 0.3),
        adr: player.adr,
        rating30: player.rating,
        kast: player.kast || 75,
        firstKills: player.firstKills || Math.floor(player.kills * 0.2),
        firstDeaths: player.firstDeaths || Math.floor(player.deaths * 0.15),
        clutchesWon: player.clutchesWon || 0,
        clutchesLost: 0,
        multiKills: player.multiKills || 0,
        utilityDamage: player.utilityDamage || player.adr * 0.1,
        flashAssists: player.flashAssists || Math.floor(player.assists * 0.3),
        teamRounds: 30,
        mvpRounds: player.mvpRounds || Math.floor(player.kills * 0.1),
        playerRole: player.playerRole || "Rifler",
        playerTier: player.playerTier || "Tier2",
      }

      const fantasyPoints = calculateFantasyPoints(performance, player.teamWon || false)

      return {
        ...player,
        performance,
        fantasyPoints,
      }
    })
    .sort((a, b) => b.fantasyPoints.totalPoints - a.fantasyPoints.totalPoints)

  const togglePlayerExpansion = (playerId: number) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId)
  }

  const getPointsColor = (points: number) => {
    if (points > 0) return "text-neon-green"
    if (points < 0) return "text-red-400"
    return "text-muted-foreground"
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "AWP":
        return <TargetIcon className="w-3 h-3" />
      case "Entry":
        return <ZapIcon className="w-3 h-3" />
      case "IGL":
        return <TrophyIcon className="w-3 h-3" />
      default:
        return null
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Tier1":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Tier2":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Tier3":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          {t(language, "fantasyScoring")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground mb-4">{t(language, "realTimeData")}</div>

        {playersWithPoints.map((player, index) => (
          <div key={player.playerId} className="bg-secondary/30 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => togglePlayerExpansion(player.playerId)}
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={index === 0 ? "default" : "secondary"}
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {index + 1}
                </Badge>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.nickname}</span>
                    {getRoleIcon(player.performance.playerRole)}
                    <Badge className={`text-xs px-1.5 py-0.5 ${getTierColor(player.performance.playerTier)}`}>
                      {player.performance.playerTier}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {player.kills}K / {player.deaths}D / {player.assists}A • {player.rating.toFixed(2)} RTG
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold text-neon-green text-lg">
                    {player.fantasyPoints.totalPoints > 0 ? "+" : ""}
                    {player.fantasyPoints.totalPoints}
                  </div>
                  <div className="text-xs text-muted-foreground">Fantasy Points</div>
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${expandedPlayer === player.playerId ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {expandedPlayer === player.playerId && (
              <div className="px-3 pb-3 border-t border-secondary/50">
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Kills ({player.kills})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.kills)}>
                        {player.fantasyPoints.breakdown.kills > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.kills.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deaths ({player.deaths})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.deaths)}>
                        {player.fantasyPoints.breakdown.deaths.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assists ({player.assists})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.assists)}>
                        {player.fantasyPoints.breakdown.assists > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.assists.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Headshots ({player.performance.headshots})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.headshots)}>
                        {player.fantasyPoints.breakdown.headshots > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.headshots.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Kills ({player.performance.firstKills})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.firstKills)}>
                        {player.fantasyPoints.breakdown.firstKills > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.firstKills.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>ADR ({player.adr})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.adr)}>
                        {player.fantasyPoints.breakdown.adr > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.adr.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating Bonus</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.rating)}>
                        {player.fantasyPoints.breakdown.rating > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>KAST ({player.performance.kast}%)</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.kast)}>
                        {player.fantasyPoints.breakdown.kast > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.kast.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utility</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.utility)}>
                        {player.fantasyPoints.breakdown.utility > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.utility.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MVP Rounds ({player.performance.mvpRounds})</span>
                      <span className={getPointsColor(player.fantasyPoints.breakdown.mvp)}>
                        {player.fantasyPoints.breakdown.mvp > 0 ? "+" : ""}
                        {player.fantasyPoints.breakdown.mvp.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {player.fantasyPoints.breakdown.multiKills > 0 && (
                  <div className="mt-2 p-2 bg-neon-green/10 border border-neon-green/20 rounded">
                    <div className="text-xs font-medium text-neon-green">
                      Multi-Kill Bonus: +{player.fantasyPoints.breakdown.multiKills.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="mt-4 p-3 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
          <div className="text-xs text-neon-blue font-medium mb-2">Advanced Scoring System:</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Kills: +2 pts (+role bonuses)</div>
            <div>• Deaths: -1 pt each</div>
            <div>• Assists: +1 pt (+0.5 for Support)</div>
            <div>• First Kills: +3 pts (+2 for Entry)</div>
            <div>• Clutches: +5 pts when won</div>
            <div>• Multi-kills: 2K(+2), 3K(+5), 4K(+10), ACE(+20)</div>
            <div>• Tier multipliers: T1(+20%), T2(base), T3(-20%)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
