"use client"

import type React from "react"

import type { Player } from "@/types/player"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { StarIcon, TargetIcon, ZapIcon, ShieldIcon, CrownIcon } from "./icons"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { useHLTVPlayer } from "@/hooks/use-hltv-data"
import { useState, memo, useCallback, useMemo } from "react"
import { useMobile } from "@/hooks/use-mobile"

interface PlayerCardProps {
  player: Player
  onAddToTeam?: (player: Player) => void
  onViewProfile?: (player: Player) => void
  isSelected?: boolean
  disabled?: boolean
  ownerTeamLogo?: string
  ownerTeamName?: string
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

export const PlayerCard = memo(function PlayerCard({
  player,
  onAddToTeam,
  onViewProfile,
  isSelected = false,
  disabled = false,
  ownerTeamLogo,
  ownerTeamName,
}: PlayerCardProps) {
  const { t } = useLanguage()
  const isMobile = useMobile()
  const RoleIcon = roleIcons[player.role]

  const shouldFetchHLTV = isSelected || (!isMobile && player.hltvId)
  const { player: hltvPlayer, loading: hltvLoading } = useHLTVPlayer(shouldFetchHLTV ? player.hltvId || null : null)

  const [imageError, setImageError] = useState(false)

  const displayPlayer = useMemo(() => {
    if (hltvPlayer) {
      return {
        ...player,
        stats: {
          rating: hltvPlayer.stats.rating,
          kd: hltvPlayer.stats.kd,
          adr: hltvPlayer.stats.adr,
          matches: hltvPlayer.stats.matches,
        },
        team: hltvPlayer.team.name || player.team,
        teamLogo: hltvPlayer.team.logo || player.teamLogo,
      }
    }
    return player
  }, [hltvPlayer, player])

  const playerImage = useMemo(() => {
    if (displayPlayer.photo && !imageError) {
      return displayPlayer.photo
    }
    return `/placeholder.svg?height=${isMobile ? 100 : 120}&width=${isMobile ? 100 : 120}&query=professional CS2 esports player ${displayPlayer.nickname} clean portrait headshot`
  }, [displayPlayer.photo, displayPlayer.nickname, imageError, isMobile])

  const handleImageError = useCallback(() => {
    console.log(`[v0] Image failed to load for ${displayPlayer.nickname}: ${displayPlayer.photo}`)
    setImageError(true)
  }, [displayPlayer.nickname, displayPlayer.photo])

  const handleCardClick = useCallback(() => {
    if (!disabled) onViewProfile?.(displayPlayer)
  }, [disabled, onViewProfile, displayPlayer])

  const handleAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!disabled) onAddToTeam?.(displayPlayer)
    },
    [disabled, onAddToTeam, displayPlayer],
  )

  return (
    <Card
      className={`
        card-hover cursor-pointer transition-all duration-200
        ${isSelected ? "ring-2 ring-neon-blue glow-neon-blue" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden
        w-full ${isMobile ? "max-w-[160px]" : "max-w-[180px]"}
      `}
      onClick={handleCardClick}
    >
      {displayPlayer.teamLogo && !isMobile && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <Image
            src={displayPlayer.teamLogo || "/placeholder.svg"}
            alt={displayPlayer.team}
            fill
            className="object-cover scale-150"
            loading="lazy"
          />
        </div>
      )}

      <CardContent className={`${isMobile ? "p-2" : "p-3"} relative z-10`}>
        <div className={`relative ${isMobile ? "mb-2" : "mb-3"}`}>
          <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={playerImage || "/placeholder.svg"}
              alt={displayPlayer.nickname}
              fill
              className="object-cover object-center"
              onError={handleImageError}
              crossOrigin="anonymous"
              loading="lazy"
              sizes={isMobile ? "160px" : "180px"}
            />
            <div
              className={`absolute top-2 right-2 ${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-background/95 rounded-full p-1 border border-border/50`}
            >
              <Image
                src={displayPlayer.teamLogo || "/placeholder.svg"}
                alt={displayPlayer.team}
                width={isMobile ? 16 : 24}
                height={isMobile ? 16 : 24}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            {ownerTeamName && (
              <div className="absolute bottom-2 left-2">
                <Badge
                  variant="secondary"
                  className={`${isMobile ? "text-xs" : "text-xs"} bg-neon-blue/20 text-neon-blue border-neon-blue/30`}
                >
                  {ownerTeamName}
                </Badge>
              </div>
            )}
            {hltvLoading && (
              <div className="absolute bottom-2 right-2">
                <Badge
                  variant="secondary"
                  className={`${isMobile ? "text-xs" : "text-xs"} bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse`}
                >
                  LOADING
                </Badge>
              </div>
            )}
            {hltvPlayer && !hltvLoading && (
              <div className="absolute bottom-2 right-2">
                <Badge
                  variant="secondary"
                  className={`${isMobile ? "text-xs" : "text-xs"} bg-green-500/20 text-green-400 border-green-500/30`}
                >
                  LIVE
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className={`space-y-${isMobile ? "1" : "2"}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold ${isMobile ? "text-xs" : "text-sm"} text-balance truncate`}>
              {displayPlayer.nickname}
            </h3>
            <div className="flex items-center gap-1">
              <RoleIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-neon-blue`} />
              <span className={`${isMobile ? "text-xs" : "text-xs"} text-muted-foreground`}>{displayPlayer.role}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`${tierColors[displayPlayer.tier]} ${isMobile ? "text-xs" : "text-xs"}`}
              size="sm"
            >
              {displayPlayer.tier}
            </Badge>
            <div className="text-right">
              <div className={`${isMobile ? "text-xs" : "text-sm"} font-bold text-neon-green`}>
                ${displayPlayer.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-3 gap-1 ${isMobile ? "text-xs" : "text-xs"}`}>
            <div className="text-center p-1">
              <div className={`font-semibold text-foreground ${isMobile ? "text-xs" : ""}`}>
                {displayPlayer.stats.rating}
              </div>
              <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}>{t.rating}</div>
            </div>
            <div className="text-center p-1">
              <div className={`font-semibold text-foreground ${isMobile ? "text-xs" : ""}`}>
                {displayPlayer.stats.kd}
              </div>
              <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}>{t.kd}</div>
            </div>
            <div className="text-center p-1">
              <div className={`font-semibold text-foreground ${isMobile ? "text-xs" : ""}`}>
                {displayPlayer.stats.adr}
              </div>
              <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}>{t.adr}</div>
            </div>
          </div>

          {onAddToTeam && (
            <Button
              onClick={handleAddClick}
              disabled={disabled}
              className={`w-full ${isMobile ? "mt-1 h-7" : "mt-2 h-8"} bg-neon-blue hover:bg-cyan-500 text-black font-semibold transition-colors ${isMobile ? "text-xs" : "text-sm"}`}
              size="sm"
            >
              {isSelected ? t.selected : t.addToTeam}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
