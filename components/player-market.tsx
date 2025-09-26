"use client"

import { useState, useMemo, useCallback } from "react"
import type { Player, PlayerRole, PlayerTier } from "@/types/player"
import { PlayerCard } from "./player-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, FilterIcon, SlidersIcon } from "./icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useMobile } from "@/hooks/use-mobile"

interface PlayerMarketProps {
  players: Player[]
  selectedPlayers: Player[]
  onAddPlayer: (player: Player) => void
  onViewProfile: (player: Player) => void
}

export function PlayerMarket({ players, selectedPlayers, onAddPlayer, onViewProfile }: PlayerMarketProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<PlayerRole | "all">("all")
  const [selectedTier, setSelectedTier] = useState<PlayerTier | "all">("all")
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">("all")
  const { t, formatT } = useLanguage()
  const isMobile = useMobile()

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      if (searchQuery && !player.nickname.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      if (selectedRole !== "all" && player.role !== selectedRole) {
        return false
      }

      if (selectedTier !== "all" && player.tier !== selectedTier) {
        return false
      }

      if (priceRange !== "all") {
        if (priceRange === "low" && player.price > 5000) return false
        if (priceRange === "mid" && (player.price <= 5000 || player.price > 7500)) return false
        if (priceRange === "high" && player.price <= 7500) return false
      }

      return true
    })
  }, [players, searchQuery, selectedRole, selectedTier, priceRange])

  const selectedPlayerIds = useMemo(() => new Set(selectedPlayers.map((p) => p.id)), [selectedPlayers])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedRole("all")
    setSelectedTier("all")
    setPriceRange("all")
  }, [])

  const renderPlayerCard = useCallback(
    (player: Player) => {
      return (
        <PlayerCard
          key={player.id}
          player={player}
          onAddToTeam={onAddPlayer}
          onViewProfile={onViewProfile}
          isSelected={selectedPlayerIds.has(player.id)}
          disabled={selectedPlayerIds.has(player.id)}
        />
      )
    },
    [onAddPlayer, onViewProfile, selectedPlayerIds],
  )

  return (
    <div className={`space-y-${isMobile ? "3" : "4 sm:space-y-6"}`}>
      {/* Market Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${isMobile ? "text-lg" : "text-xl sm:text-2xl"} font-bold text-balance`}>
            {t.playerMarketTitle}
          </h2>
          <p className={`${isMobile ? "text-sm" : "text-sm sm:text-base"} text-muted-foreground`}>
            {formatT("playersAvailable", { count: filteredPlayers.length })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-neon-blue border-neon-blue/20 ${isMobile ? "text-xs" : "text-xs sm:text-sm"}`}
        >
          <FilterIcon className={`${isMobile ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4"} mr-1`} />
          <span className={isMobile ? "" : "hidden sm:inline"}>{t.tier1Only}</span>
          <span className={isMobile ? "" : "sm:hidden"}>{t.t1}</span>
        </Badge>
      </div>

      {/* Filters */}
      <div
        className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"}`}
      >
        {/* Search */}
        <div className={`relative ${isMobile ? "" : "sm:col-span-2 lg:col-span-1"}`}>
          <SearchIcon
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isMobile ? "w-4 h-4" : "w-4 h-4"}`}
          />
          <Input
            placeholder={t.searchPlayers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 bg-card/50 border-border/50 ${isMobile ? "h-9" : "h-10 sm:h-9"}`}
          />
        </div>

        {/* Role Filter */}
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as PlayerRole | "all")}>
          <SelectTrigger className={`bg-card/50 border-border/50 ${isMobile ? "h-9" : "h-10 sm:h-9"}`}>
            <SelectValue placeholder={t.allRoles} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allRoles}</SelectItem>
            <SelectItem value="AWP">{t.awp}</SelectItem>
            <SelectItem value="Entry">{t.entry}</SelectItem>
            <SelectItem value="Rifler">{t.rifler}</SelectItem>
            <SelectItem value="Support">{t.support}</SelectItem>
            <SelectItem value="IGL">{t.igl}</SelectItem>
          </SelectContent>
        </Select>

        {/* Tier Filter */}
        <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as PlayerTier | "all")}>
          <SelectTrigger className={`bg-card/50 border-border/50 ${isMobile ? "h-9" : "h-10 sm:h-9"}`}>
            <SelectValue placeholder={t.allTiers} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allTiers}</SelectItem>
            <SelectItem value="Tier1">{t.tier1}</SelectItem>
            <SelectItem value="Tier2">{t.tier2}</SelectItem>
            <SelectItem value="Tier3">{t.tier3}</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Filter */}
        <Select value={priceRange} onValueChange={(value) => setPriceRange(value as "all" | "low" | "mid" | "high")}>
          <SelectTrigger className={`bg-card/50 border-border/50 ${isMobile ? "h-9" : "h-10 sm:h-9"}`}>
            <SelectValue placeholder={t.allPrices} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allPrices}</SelectItem>
            <SelectItem value="low">{t.under5k}</SelectItem>
            <SelectItem value="mid">{t.between5k7k}</SelectItem>
            <SelectItem value="high">{t.over7k}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Player Grid */}
      <div
        className={`grid ${
          isMobile
            ? "grid-cols-2 gap-2 justify-items-center"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 justify-items-center"
        }`}
      >
        {filteredPlayers.map(renderPlayerCard)}
      </div>

      {/* Empty State */}
      {filteredPlayers.length === 0 && (
        <div className={`text-center ${isMobile ? "py-6" : "py-8 sm:py-12"}`}>
          <SlidersIcon
            className={`${isMobile ? "w-8 h-8" : "w-10 h-10 sm:w-12 sm:h-12"} text-muted-foreground mx-auto mb-4`}
          />
          <h3 className={`${isMobile ? "text-sm" : "text-base sm:text-lg"} font-semibold mb-2`}>{t.noPlayersFound}</h3>
          <p className={`${isMobile ? "text-sm" : "text-sm sm:text-base"} text-muted-foreground mb-4`}>
            {t.adjustFilters}
          </p>
          <Button variant="outline" onClick={clearFilters} className={`${isMobile ? "h-8" : "h-9 sm:h-10"}`}>
            {t.clearFilters}
          </Button>
        </div>
      )}
    </div>
  )
}
