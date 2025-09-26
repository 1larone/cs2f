import { type NextRequest, NextResponse } from "next/server"
import { mockPlayers } from "@/lib/mock-data"

interface HLTVPlayerStats {
  nickname: string
  realName: string
  rating: string
  kd: string
  adr: string
  hltvUrl: string
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const playerId = params.id

    console.log("[v0] Fetching player stats for ID:", playerId)

    const player = mockPlayers.find((p) => p.id === playerId)

    if (!player) {
      console.log("[v0] Player not found in mock data:", playerId)
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    const playerStats: HLTVPlayerStats = {
      nickname: player.nickname,
      realName: player.realName,
      rating: player.stats.rating.toFixed(2),
      kd: player.stats.kd.toFixed(2),
      adr: player.stats.adr.toFixed(1),
      hltvUrl: `https://www.hltv.org/player/${player.hltvId}/-`,
    }

    console.log("[v0] Successfully retrieved player stats:", playerStats)

    return NextResponse.json(playerStats)
  } catch (error) {
    console.error("[v0] Error fetching player stats:", error)

    return NextResponse.json({ error: "Failed to fetch player statistics" }, { status: 500 })
  }
}

function generateMockStats(playerId: string): Omit<HLTVPlayerStats, "hltvUrl"> {
  // Generate consistent mock data based on player ID
  const seed = Number.parseInt(playerId) || 1000
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    return min + (x - Math.floor(x)) * (max - min)
  }

  return {
    nickname: "Player",
    realName: "Unknown Player",
    rating: (0.8 + random(0, 0.6)).toFixed(2), // Rating between 0.8-1.4
    kd: (0.7 + random(0, 0.8)).toFixed(2), // K/D between 0.7-1.5
    adr: (60 + random(0, 40)).toFixed(1), // ADR between 60-100
  }
}
