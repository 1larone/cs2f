"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TargetIcon, ZapIcon, TrophyIcon, ShieldIcon, StarIcon } from "@/components/icons"

interface PlayerDetailedStatsProps {
  player: {
    id: number
    nickname: string
    realName: string
    team: string
    role: "AWP" | "Entry" | "Rifler" | "Support" | "IGL"
    tier: "Tier1" | "Tier2" | "Tier3"
    stats: {
      rating: number
      kd: number
      adr: number
      kast: number
      headshots: number
      firstKills: number
      clutches: number
      multiKills: number
      mapsPlayed: number
      fantasyAverage: number
    }
    recentForm: number[] // последние 5 матчей fantasy points
  }
}

export function PlayerDetailedStats({ player }: PlayerDetailedStatsProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "AWP":
        return <TargetIcon className="w-4 h-4" />
      case "Entry":
        return <ZapIcon className="w-4 h-4" />
      case "IGL":
        return <TrophyIcon className="w-4 h-4" />
      case "Support":
        return <ShieldIcon className="w-4 h-4" />
      default:
        return <StarIcon className="w-4 h-4" />
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

  const getFormColor = (points: number) => {
    if (points >= 15) return "bg-neon-green"
    if (points >= 10) return "bg-yellow-500"
    if (points >= 5) return "bg-orange-500"
    return "bg-red-500"
  }

  const averageForm = player.recentForm.reduce((sum, points) => sum + points, 0) / player.recentForm.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getRoleIcon(player.role)}
              {player.nickname}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {player.realName} • {player.team}
            </div>
          </div>
          <Badge className={`${getTierColor(player.tier)}`}>{player.tier}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rating 3.0</span>
              <span className="font-medium">{player.stats.rating.toFixed(2)}</span>
            </div>
            <Progress value={Math.min(player.stats.rating * 50, 100)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>K/D Ratio</span>
              <span className="font-medium">{player.stats.kd.toFixed(2)}</span>
            </div>
            <Progress value={Math.min(player.stats.kd * 50, 100)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ADR</span>
              <span className="font-medium">{player.stats.adr}</span>
            </div>
            <Progress value={Math.min((player.stats.adr / 100) * 100, 100)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>KAST %</span>
              <span className="font-medium">{player.stats.kast}%</span>
            </div>
            <Progress value={player.stats.kast} className="h-2" />
          </div>
        </div>

        {/* Specialized Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span>Headshots %</span>
            <span className="font-medium">{player.stats.headshots}%</span>
          </div>
          <div className="flex justify-between">
            <span>First Kills</span>
            <span className="font-medium">{player.stats.firstKills}</span>
          </div>
          <div className="flex justify-between">
            <span>Clutches Won</span>
            <span className="font-medium">{player.stats.clutches}</span>
          </div>
          <div className="flex justify-between">
            <span>Multi-Kills</span>
            <span className="font-medium">{player.stats.multiKills}</span>
          </div>
        </div>

        {/* Fantasy Performance */}
        <div className="p-3 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neon-blue">Fantasy Average</span>
            <span className="text-lg font-bold text-neon-green">{player.stats.fantasyAverage.toFixed(1)} pts</span>
          </div>
          <div className="text-xs text-muted-foreground">Based on {player.stats.mapsPlayed} maps played</div>
        </div>

        {/* Recent Form */}
        <div>
          <div className="text-sm font-medium mb-2">Recent Form (Last 5 matches)</div>
          <div className="flex gap-1 mb-2">
            {player.recentForm.map((points, index) => (
              <div
                key={index}
                className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium text-white ${getFormColor(points)}`}
              >
                {points.toFixed(0)}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">Average: {averageForm.toFixed(1)} pts</div>
        </div>
      </CardContent>
    </Card>
  )
}
