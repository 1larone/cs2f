"use client"

import type { Player } from "@/types/player"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  TargetIcon,
  ZapIcon,
  StarIcon,
  ShieldIcon,
  CrownIcon,
  TrendingUpIcon,
  CalendarIcon,
  AwardIcon,
  UsersIcon,
} from "./icons"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { useHLTVPlayerStats } from "@/hooks/use-hltv-player-stats"

interface PlayerProfileModalProps {
  player: Player
  isOpen: boolean
  onClose: () => void
  onAddToTeam: () => void
  isInTeam: boolean
}

const roleIcons = {
  AWP: TargetIcon,
  Entry: ZapIcon,
  Rifler: StarIcon,
  Support: ShieldIcon,
  IGL: CrownIcon,
}

const tierColors = {
  Tier1: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
  Tier2: "text-gray-300 border-gray-300/20 bg-gray-300/10",
  Tier3: "text-orange-400 border-orange-400/20 bg-orange-400/10",
}

// Mock recent matches data
const mockRecentMatches = [
  { opponent: "Astralis", result: "W", score: "16-12", rating: 1.34, kills: 24, deaths: 18 },
  { opponent: "FaZe", result: "L", score: "14-16", rating: 1.12, kills: 19, deaths: 17 },
  { opponent: "G2", result: "W", score: "16-8", rating: 1.45, kills: 28, deaths: 15 },
  { opponent: "Vitality", result: "W", score: "16-13", rating: 1.28, kills: 22, deaths: 19 },
  { opponent: "MOUZ", result: "L", score: "12-16", rating: 0.98, kills: 16, deaths: 20 },
]

export function PlayerProfileModal({ player, isOpen, onClose, onAddToTeam, isInTeam }: PlayerProfileModalProps) {
  const { t } = useLanguage()
  const RoleIcon = roleIcons[player.role]

  const { stats: hltvStats, loading: hltvLoading, error: hltvError } = useHLTVPlayerStats(player.id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-balance">{t.playerProfile}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Player Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Player Photo */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-32 h-32 sm:w-48 sm:h-48 bg-muted rounded-lg overflow-hidden relative">
                <Image src={player.photo || "/placeholder.svg"} alt={player.nickname} fill className="object-cover" />
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-balance">{player.nickname}</h1>
                <p className="text-lg sm:text-xl text-muted-foreground">{player.realName}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-background/90 rounded-full p-1">
                    <Image
                      src={player.teamLogo || "/placeholder.svg"}
                      alt={player.team}
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{player.team}</span>
                </div>

                <div className="flex items-center gap-2">
                  <RoleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                  <span className="font-semibold text-sm sm:text-base">{player.role}</span>
                </div>

                <Badge variant="outline" className={`text-xs sm:text-sm ${tierColors[player.tier]}`}>
                  {player.tier}
                </Badge>
              </div>

              <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl font-bold text-neon-green">${player.price.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t.marketValue}</div>
              </div>

              <Button
                onClick={onAddToTeam}
                disabled={isInTeam}
                size="lg"
                className="w-full bg-neon-blue hover:bg-neon-blue/80 text-black font-semibold h-11 sm:h-12"
              >
                {isInTeam ? t.alreadyInTeam : t.addToTeam}
              </Button>
            </div>
          </div>

          {/* HLTV Statistics */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                {t.hltvStatistics}
                {hltvLoading && <span className="text-xs text-muted-foreground">(Loading real data...)</span>}
                {hltvError && <span className="text-xs text-red-400">(Using cached data)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-neon-blue">
                    {hltvStats?.rating || player.stats.rating}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t.rating20}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-neon-green">
                    {hltvStats?.kd || player.stats.kd}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t.kdRatio}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                    {hltvStats?.adr || player.stats.adr}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t.adr}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{player.stats.matches}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t.mapsPlayed}</div>
                </div>
              </div>

              {hltvStats?.hltvUrl && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <a
                    href={hltvStats.hltvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neon-blue hover:text-neon-blue/80 underline"
                  >
                    View full stats on HLTV →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                {t.recentMatches}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {mockRecentMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-background/30 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                          match.result === "W" ? "bg-neon-green/20 text-neon-green" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {match.result}
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base">vs {match.opponent}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{match.score}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-neon-blue">{match.rating}</div>
                        <div className="text-muted-foreground">{t.rating}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">
                          {match.kills}/{match.deaths}
                        </div>
                        <div className="text-muted-foreground">{t.kd}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <AwardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  {t.strengths}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Clutch Success Rate</span>
                  <span className="font-semibold text-neon-green text-sm">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">First Kill Rate</span>
                  <span className="font-semibold text-neon-green text-sm">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Multi-Kill Rounds</span>
                  <span className="font-semibold text-neon-green text-sm">32%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                  {t.teamImpact}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Support Flash Assists</span>
                  <span className="font-semibold text-neon-blue text-sm">0.8/round</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Trade Kill Success</span>
                  <span className="font-semibold text-neon-blue text-sm">76%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Round Impact</span>
                  <span className="font-semibold text-neon-blue text-sm">1.34</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
