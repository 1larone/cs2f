"use client"

import type { TeamSlot, Player, TeamType } from "@/types/player"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TargetIcon, ZapIcon, StarIcon, ShieldIcon, CrownIcon, XIcon, PlusIcon, SwapIcon } from "./icons"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

interface TeamSlotCardProps {
  slot: TeamSlot
  teamType: TeamType
  onRemovePlayer: (role: TeamSlot["role"]) => void
  onViewProfile: (player: Player) => void
  onSwapPlayer: (player: Player, fromTeam: TeamType) => void
  canSwap: boolean
}

const roleIcons = {
  AWP: TargetIcon,
  Entry: ZapIcon,
  Rifler: StarIcon,
  Support: ShieldIcon,
  IGL: CrownIcon,
}

const roleColors = {
  AWP: "from-red-500/20 to-red-600/20 border-red-500/30",
  Entry: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
  Rifler: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  Support: "from-green-500/20 to-green-600/20 border-green-500/30",
  IGL: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
}

const tierColors = {
  Tier1: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
  Tier2: "text-gray-300 border-gray-300/20 bg-gray-300/10",
  Tier3: "text-orange-400 border-orange-400/20 bg-orange-400/10",
}

export function TeamSlotCard({
  slot,
  teamType,
  onRemovePlayer,
  onViewProfile,
  onSwapPlayer,
  canSwap,
}: TeamSlotCardProps) {
  const { t, formatT } = useLanguage()
  const RoleIcon = roleIcons[slot.role]
  const isEmpty = !slot.player

  const teamRoleColors =
    teamType === "main"
      ? roleColors
      : {
          AWP: "from-red-400/15 to-red-500/15 border-red-400/25",
          Entry: "from-orange-400/15 to-orange-500/15 border-orange-400/25",
          Rifler: "from-blue-400/15 to-blue-500/15 border-blue-400/25",
          Support: "from-green-400/15 to-green-500/15 border-green-400/25",
          IGL: "from-purple-400/15 to-purple-500/15 border-purple-400/25",
        }

  if (isEmpty) {
    return (
      <Card className={`bg-gradient-to-br ${teamRoleColors[slot.role]} border-dashed border-2 h-56 sm:h-64`}>
        <CardContent className="p-3 sm:p-4 h-full flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <RoleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-2">{slot.role}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            {teamType === "main" ? t.selectMainPlayer : t.selectReservePlayer}
          </p>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted/30 rounded-full flex items-center justify-center">
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`bg-gradient-to-br ${teamRoleColors[slot.role]} border hover:shadow-lg transition-all duration-300 cursor-pointer`}
    >
      <CardContent className="p-3 sm:p-4 h-56 sm:h-64 flex flex-col">
        {/* Header with role and action buttons */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <RoleIcon
              className={`w-4 h-4 sm:w-5 sm:h-5 ${teamType === "main" ? "text-neon-blue" : "text-neon-green"}`}
            />
            <span className="font-semibold text-xs sm:text-sm">{slot.role}</span>
            <Badge
              variant="outline"
              className={`text-xs px-1 ${
                teamType === "main"
                  ? "text-neon-blue border-neon-blue/30 bg-neon-blue/10"
                  : "text-neon-green border-neon-green/30 bg-neon-green/10"
              }`}
            >
              {teamType === "main" ? "M" : "R"}
            </Badge>
          </div>
          <div className="flex gap-1">
            {canSwap && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSwapPlayer(slot.player!, teamType)
                }}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-neon-green/20 hover:text-neon-green"
                title={formatT("moveToTeam", {
                  team: teamType === "main" ? t.reserveTeam.toLowerCase() : t.mainTeam.toLowerCase(),
                })}
              >
                <SwapIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemovePlayer(slot.role)
              }}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Player Photo */}
        <div className="relative mb-2 sm:mb-3 flex-1 cursor-pointer" onClick={() => onViewProfile(slot.player!)}>
          <div className="w-full h-20 sm:h-24 bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={slot.player!.photo || "/placeholder.svg"}
              alt={slot.player!.nickname}
              fill
              className="object-cover"
            />
            {/* Team Logo Overlay */}
            <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-background/90 rounded-full p-1">
              <Image
                src={slot.player!.teamLogo || "/placeholder.svg"}
                alt={slot.player!.team}
                width={16}
                height={16}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="space-y-1 sm:space-y-2">
          <div className="text-center">
            <h4 className="font-bold text-xs sm:text-sm text-balance">{slot.player!.nickname}</h4>
            <p className="text-xs text-muted-foreground">{slot.player!.team}</p>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${tierColors[slot.player!.tier]}`}>
              {slot.player!.tier}
            </Badge>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-neon-green">${slot.player!.price.toLocaleString()}</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-center">
              <div className="font-semibold">{slot.player!.stats.rating}</div>
              <div className="text-muted-foreground">{t.rating}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{slot.player!.stats.kd}</div>
              <div className="text-muted-foreground">{t.kd}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
