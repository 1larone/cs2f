import { type NextRequest, NextResponse } from "next/server"
import { hltvClient } from "@/lib/hltv-api"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const playerId = searchParams.get("id")

  try {
    if (playerId) {
      // Get specific player
      const player = await hltvClient.getPlayer(Number.parseInt(playerId))
      if (!player) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }
      return NextResponse.json(player)
    } else if (query) {
      // Search players
      const players = await hltvClient.searchPlayers(query)
      return NextResponse.json(players)
    } else {
      return NextResponse.json({ error: "Missing query or player ID" }, { status: 400 })
    }
  } catch (error) {
    console.error("HLTV API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
