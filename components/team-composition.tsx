"use client"

import { useState, useMemo, useCallback, Suspense } from "react"
import type { Player, PlayerRole, TeamSlot, TeamType } from "@/types/player"
import { mockPlayers } from "@/lib/mock-data"
import { PlayerMarket } from "./player-market"
import { TeamSlotCard } from "./team-slot-card"
import { PlayerProfileModal } from "./player-profile-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SaveIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon } from "./icons"
import { useLanguage } from "@/contexts/language-context"
import { useMobile } from "@/hooks/use-mobile"

const initialTeamSlots: TeamSlot[] = [
  { role: "AWP", player: null },
  { role: "Entry", player: null },
  { role: "Rifler", player: null },
  { role: "Support", player: null },
  { role: "IGL", player: null },
]

function PlayerMarketSkeleton() {
  const isMobile = useMobile()
  return (
    <div className={`space-y-${isMobile ? "3" : "4 sm:space-y-6"}`}>
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-2"></div>
        <div className="h-4 bg-muted rounded w-32"></div>
      </div>
      <div
        className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"}`}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg aspect-[3/4] w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TeamComposition() {
  const [activeTeamType, setActiveTeamType] = useState<TeamType>("main")
  const [mainTeamSlots, setMainTeamSlots] = useState<TeamSlot[]>(initialTeamSlots)
  const [reserveTeamSlots, setReserveTeamSlots] = useState<TeamSlot[]>(initialTeamSlots)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showPlayerProfile, setShowPlayerProfile] = useState(false)
  const { t, formatT } = useLanguage()
  const isMobile = useMobile()

  const currentTeamSlots = activeTeamType === "main" ? mainTeamSlots : reserveTeamSlots
  const setCurrentTeamSlots = activeTeamType === "main" ? setMainTeamSlots : setReserveTeamSlots

  const allSelectedPlayers = useMemo(
    () => [
      ...(mainTeamSlots.map((slot) => slot.player).filter(Boolean) as Player[]),
      ...(reserveTeamSlots.map((slot) => slot.player).filter(Boolean) as Player[]),
    ],
    [mainTeamSlots, reserveTeamSlots],
  )

  const currentTeamPlayers = useMemo(
    () => currentTeamSlots.map((slot) => slot.player).filter(Boolean) as Player[],
    [currentTeamSlots],
  )

  const totalCost = useMemo(
    () => allSelectedPlayers.reduce((sum, player) => sum + player.price, 0),
    [allSelectedPlayers],
  )

  const remainingBudget = 100000 - totalCost

  const handleAddPlayer = useCallback(
    (player: Player) => {
      if (allSelectedPlayers.some((p) => p.id === player.id)) return

      const slotIndex = currentTeamSlots.findIndex((slot) => slot.role === player.role && !slot.player)
      if (slotIndex !== -1) {
        const newSlots = [...currentTeamSlots]
        newSlots[slotIndex] = { ...newSlots[slotIndex], player }
        setCurrentTeamSlots(newSlots)
      }
    },
    [allSelectedPlayers, currentTeamSlots, setCurrentTeamSlots],
  )

  const handleRemovePlayer = useCallback(
    (role: PlayerRole) => {
      const slotIndex = currentTeamSlots.findIndex((slot) => slot.role === role)
      if (slotIndex !== -1) {
        const newSlots = [...currentTeamSlots]
        newSlots[slotIndex] = { ...newSlots[slotIndex], player: null }
        setCurrentTeamSlots(newSlots)
      }
    },
    [currentTeamSlots, setCurrentTeamSlots],
  )

  const handleSwapPlayer = useCallback(
    (player: Player, fromTeam: TeamType) => {
      const targetTeam = fromTeam === "main" ? "reserve" : "main"
      const sourceSlots = fromTeam === "main" ? mainTeamSlots : reserveTeamSlots
      const targetSlots = fromTeam === "main" ? reserveTeamSlots : mainTeamSlots
      const setSourceSlots = fromTeam === "main" ? setMainTeamSlots : setReserveTeamSlots
      const setTargetSlots = fromTeam === "main" ? setReserveTeamSlots : setMainTeamSlots

      const sourceIndex = sourceSlots.findIndex((slot) => slot.player?.id === player.id)
      if (sourceIndex === -1) return

      const targetIndex = targetSlots.findIndex((slot) => slot.role === player.role && !slot.player)
      if (targetIndex === -1) return

      const newSourceSlots = [...sourceSlots]
      newSourceSlots[sourceIndex] = { ...newSourceSlots[sourceIndex], player: null }
      setSourceSlots(newSourceSlots)

      const newTargetSlots = [...targetSlots]
      newTargetSlots[targetIndex] = { ...newTargetSlots[targetIndex], player }
      setTargetSlots(newTargetSlots)
    },
    [mainTeamSlots, reserveTeamSlots, setMainTeamSlots, setReserveTeamSlots],
  )

  const handleViewProfile = useCallback((player: Player) => {
    setSelectedPlayer(player)
    setShowPlayerProfile(true)
  }, [])

  const handleSaveTeam = useCallback(() => {
    console.log("Saving teams:", { main: mainTeamSlots, reserve: reserveTeamSlots })
  }, [mainTeamSlots, reserveTeamSlots])

  const isMainTeamComplete = mainTeamSlots.every((slot) => slot.player !== null)
  const isReserveTeamComplete = reserveTeamSlots.every((slot) => slot.player !== null)

  return (
    <div className={`space-y-${isMobile ? "3" : "4 sm:space-y-6"}`}>
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-border/50">
        <div
          className={`flex ${isMobile ? "flex-col gap-3" : "flex-col sm:flex-row sm:items-center sm:justify-between"} mb-4 ${isMobile ? "" : "gap-3 sm:gap-0"}`}
        >
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-2xl sm:text-3xl"} font-bold text-balance`}>
              {t.teamComposition}
            </h1>
            <p className={`${isMobile ? "text-sm" : "text-sm sm:text-base"} text-muted-foreground`}>
              {t.teamCompositionSubtitle}
            </p>
          </div>
          <div className={`${isMobile ? "text-left" : "text-left sm:text-right"} space-y-1`}>
            <div className={`${isMobile ? "text-lg" : "text-xl sm:text-2xl"} font-bold text-neon-green`}>
              ${remainingBudget.toLocaleString()}
            </div>
            <div className={`${isMobile ? "text-xs" : "text-xs sm:text-sm"} text-muted-foreground`}>
              {t.remainingBudget}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-background/50 rounded-lg p-1 flex">
            <Button
              variant={activeTeamType === "main" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTeamType("main")}
              className={`${isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"} font-medium transition-all ${
                activeTeamType === "main" ? "bg-neon-blue text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UsersIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-2`} />
              {t.mainTeam} ({mainTeamSlots.filter((slot) => slot.player).length}/5)
            </Button>
            <Button
              variant={activeTeamType === "reserve" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTeamType("reserve")}
              className={`${isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"} font-medium transition-all ${
                activeTeamType === "reserve"
                  ? "bg-neon-green text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UsersIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-2`} />
              {t.reserveTeam} ({reserveTeamSlots.filter((slot) => slot.player).length}/5)
            </Button>
          </div>
        </div>

        <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"}`}>
          <div className={`bg-background/50 rounded-lg ${isMobile ? "p-2" : "p-3 sm:p-4"} text-center`}>
            <UsersIcon
              className={`${isMobile ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"} mx-auto mb-2 ${activeTeamType === "main" ? "text-neon-blue" : "text-neon-green"}`}
            />
            <div className={`${isMobile ? "text-sm" : "text-base sm:text-lg"} font-bold`}>
              {currentTeamPlayers.length}/5
            </div>
            <div className={`${isMobile ? "text-xs" : "text-xs sm:text-sm"} text-muted-foreground`}>
              {activeTeamType === "main" ? t.mainTeam : t.reserveTeam} {t.players}
            </div>
          </div>
          <div className={`bg-background/50 rounded-lg ${isMobile ? "p-2" : "p-3 sm:p-4"} text-center`}>
            <TrendingUpIcon
              className={`${isMobile ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"} mx-auto mb-2 ${activeTeamType === "main" ? "text-neon-blue" : "text-neon-green"}`}
            />
            <div className={`${isMobile ? "text-sm" : "text-base sm:text-lg"} font-bold`}>
              {currentTeamPlayers.length > 0
                ? (currentTeamPlayers.reduce((sum, p) => sum + p.stats.rating, 0) / currentTeamPlayers.length).toFixed(
                    2,
                  )
                : "0.00"}
            </div>
            <div className={`${isMobile ? "text-xs" : "text-xs sm:text-sm"} text-muted-foreground`}>{t.avgRating}</div>
          </div>
          {!isMobile && (
            <>
              <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-base sm:text-lg font-bold text-yellow-400">
                  {currentTeamPlayers.filter((p) => p.tier === "Tier1").length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t.tier1Players}</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-base sm:text-lg font-bold">
                  ${allSelectedPlayers.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t.totalCost}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className={`grid w-full grid-cols-2 bg-card/50 ${isMobile ? "h-10" : "h-11 sm:h-10"}`}>
          <TabsTrigger
            value="team"
            className={`data-[state=active]:bg-neon-blue data-[state=active]:text-black ${isMobile ? "text-sm" : "text-sm sm:text-base"}`}
          >
            <UsersIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1 sm:mr-2`} />
            <span className={isMobile ? "" : "hidden sm:inline"}>{t.myTeams}</span>
            <span className={isMobile ? "" : "sm:hidden"}>{t.teams}</span>
          </TabsTrigger>
          <TabsTrigger
            value="market"
            className={`data-[state=active]:bg-neon-blue data-[state=active]:text-black ${isMobile ? "text-sm" : "text-sm sm:text-base"}`}
          >
            <ShoppingCartIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1 sm:mr-2`} />
            <span className={isMobile ? "" : "hidden sm:inline"}>{t.playerMarket}</span>
            <span className={isMobile ? "" : "sm:hidden"}>{t.market}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className={`space-y-${isMobile ? "3" : "4 sm:space-y-6"}`}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"}`}
          >
            {currentTeamSlots.map((slot) => (
              <TeamSlotCard
                key={`${activeTeamType}-${slot.role}`}
                slot={slot}
                teamType={activeTeamType}
                onRemovePlayer={handleRemovePlayer}
                onViewProfile={handleViewProfile}
                onSwapPlayer={handleSwapPlayer}
                canSwap={slot.player !== null}
              />
            ))}
          </div>

          {/* Save Team Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSaveTeam}
              disabled={!isMainTeamComplete && !isReserveTeamComplete}
              size="lg"
              className={`bg-neon-green hover:bg-neon-green/80 text-black font-semibold ${isMobile ? "px-4 h-10 text-sm" : "px-6 sm:px-8 h-11 sm:h-12"}`}
            >
              <SaveIcon className={`${isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} mr-2`} />
              <span className={`${isMobile ? "text-sm" : "text-sm sm:text-base"}`}>{t.saveTeamCompositions}</span>
            </Button>
          </div>

          {/* Team Status */}
          <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-1 sm:grid-cols-2 gap-4"}`}>
            {/* Main Team Status */}
            <div
              className={`rounded-lg ${isMobile ? "p-3" : "p-3 sm:p-4"} border ${
                isMainTeamComplete ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${isMobile ? "text-sm" : "text-sm sm:text-base"} ${
                  isMainTeamComplete ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {t.mainTeam}{" "}
                {isMainTeamComplete
                  ? t.complete
                  : `(${5 - mainTeamSlots.filter((slot) => slot.player).length} ${t.missing})`}
              </h3>
              {!isMainTeamComplete && (
                <div className={`space-y-1 ${isMobile ? "text-xs" : "text-xs sm:text-sm"}`}>
                  {mainTeamSlots
                    .filter((slot) => !slot.player)
                    .map((slot) => (
                      <div key={slot.role} className="text-muted-foreground">
                        • {formatT("missingPlayer", { role: slot.role })}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Reserve Team Status */}
            <div
              className={`rounded-lg ${isMobile ? "p-3" : "p-3 sm:p-4"} border ${
                isReserveTeamComplete ? "bg-green-500/10 border-green-500/20" : "bg-blue-500/10 border-blue-500/20"
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${isMobile ? "text-sm" : "text-sm sm:text-base"} ${
                  isReserveTeamComplete ? "text-green-400" : "text-blue-400"
                }`}
              >
                {t.reserveTeam}{" "}
                {isReserveTeamComplete
                  ? t.complete
                  : `(${5 - reserveTeamSlots.filter((slot) => slot.player).length} ${t.missing})`}
              </h3>
              {!isReserveTeamComplete && (
                <div className={`space-y-1 ${isMobile ? "text-xs" : "text-xs sm:text-sm"}`}>
                  {reserveTeamSlots
                    .filter((slot) => !slot.player)
                    .map((slot) => (
                      <div key={slot.role} className="text-muted-foreground">
                        • {formatT("missingPlayer", { role: slot.role })}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market">
          <Suspense fallback={<PlayerMarketSkeleton />}>
            <PlayerMarket
              players={mockPlayers}
              selectedPlayers={allSelectedPlayers}
              onAddPlayer={handleAddPlayer}
              onViewProfile={handleViewProfile}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          isOpen={showPlayerProfile}
          onClose={() => setShowPlayerProfile(false)}
          onAddToTeam={() => handleAddPlayer(selectedPlayer)}
          isInTeam={allSelectedPlayers.some((p) => p.id === selectedPlayer.id)}
        />
      )}
    </div>
  )
}
