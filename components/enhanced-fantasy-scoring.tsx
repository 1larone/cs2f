"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useEnhancedFantasyData } from "@/hooks/use-enhanced-fantasy-data"
import { useState } from "react"
import { ChevronDownIcon, RefreshCwIcon } from "@/components/icons"

export function EnhancedFantasyScoring() {
  const { language } = useLanguage()
  const { playerFantasyStats, playerAverages, recentSeries, loading, error, refreshData } = useEnhancedFantasyData()

  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"recent" | "averages">("recent")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
            Enhanced Fantasy Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
            <span className="ml-2">Loading GraphQL fantasy data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Fantasy Scoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-400">
            <p>Error loading fantasy data: {error}</p>
            <Button onClick={refreshData} className="mt-2">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayData =
    viewMode === "recent"
      ? playerFantasyStats.slice(0, 20).sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      : Array.from(playerAverages.values())
          .slice(0, 20)
          .sort((a, b) => b.fantasyPoints - a.fantasyPoints)

  const togglePlayerExpansion = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId)
  }

  const getPointsColor = (points: number) => {
    if (points > 20) return "text-yellow-400"
    if (points > 10) return "text-neon-green"
    if (points > 0) return "text-blue-400"
    if (points < 0) return "text-red-400"
    return "text-muted-foreground"
  }

  const getPerformanceGrade = (points: number) => {
    if (points > 25) return { grade: "S+", color: "bg-yellow-500/20 text-yellow-400" }
    if (points > 20) return { grade: "S", color: "bg-yellow-500/20 text-yellow-300" }
    if (points > 15) return { grade: "A", color: "bg-neon-green/20 text-neon-green" }
    if (points > 10) return { grade: "B", color: "bg-blue-500/20 text-blue-400" }
    if (points > 5) return { grade: "C", color: "bg-gray-500/20 text-gray-400" }
    return { grade: "D", color: "bg-red-500/20 text-red-400" }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
            Enhanced Fantasy Scoring
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("recent")}
            >
              Recent Performances
            </Button>
            <Button
              variant={viewMode === "averages" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("averages")}
            >
              Player Averages
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCwIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            {viewMode === "recent"
              ? `${playerFantasyStats.length} recent performances from ${recentSeries.length} series`
              : `Averages for ${playerAverages.size} players`}
          </span>
          <span>Real-time GraphQL data</span>
        </div>

        {displayData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No fantasy data available. Check your GRID API configuration.
          </div>
        ) : (
          displayData.map((player, index) => {
            const performance = getPerformanceGrade(player.fantasyPoints)
            const kd = player.kills / Math.max(1, player.deaths)

            return (
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
                        <Badge className={`text-xs px-1.5 py-0.5 ${performance.color}`}>{performance.grade}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(player.kills)}K / {Math.round(player.deaths)}D / {Math.round(player.assists)}A •{" "}
                        {kd.toFixed(2)} K/D • {Math.round(player.adr)} ADR
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`font-bold text-lg ${getPointsColor(player.fantasyPoints)}`}>
                        {player.fantasyPoints > 0 ? "+" : ""}
                        {player.fantasyPoints.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {viewMode === "recent" ? "Fantasy Points" : "Avg Points"}
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${expandedPlayer === player.playerId ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {expandedPlayer === player.playerId && (
                  <div className="px-3 pb-3 border-t border-secondary/50">
                    <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                      <div className="space-y-2">
                        <h4 className="font-medium text-neon-blue">Combat Stats</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Kills</span>
                            <span className="text-neon-green">{Math.round(player.kills)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Deaths</span>
                            <span className="text-red-400">{Math.round(player.deaths)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assists</span>
                            <span className="text-blue-400">{Math.round(player.assists)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ADR</span>
                            <span>{Math.round(player.adr)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-neon-blue">Special Actions</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Clutches</span>
                            <span className="text-yellow-400">{Math.round(player.clutches)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>MVPs</span>
                            <span className="text-yellow-400">{Math.round(player.mvps)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Entry Duels Won</span>
                            <span className="text-neon-green">{Math.round(player.entryDuelsWon)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Entry Duels Lost</span>
                            <span className="text-red-400">{Math.round(player.entryDuelsLost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-neon-blue/10 border border-neon-blue/20 rounded">
                      <div className="text-xs">
                        <span className="font-medium text-neon-blue">Fantasy Formula: </span>
                        <span className="text-muted-foreground">
                          Kills×2 - Deaths + Assists + Clutches×3 + MVPs×5 + Entry Duels + ADR/Rating Bonuses
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        <div className="mt-4 p-3 bg-gradient-to-r from-neon-blue/10 to-neon-green/10 border border-neon-blue/20 rounded-lg">
          <div className="text-xs text-neon-blue font-medium mb-2">GraphQL Enhanced Scoring:</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Real-time data from GRID API GraphQL endpoint</div>
            <div>• Advanced statistics including clutches, MVPs, and entry duels</div>
            <div>• Performance grades: S+ (25+), S (20+), A (15+), B (10+), C (5+), D (&lt;5)</div>
            <div>• {viewMode === "recent" ? "Recent match performances" : "Historical averages"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
