import { type NextRequest, NextResponse } from "next/server"
import { matchAPI } from "@/lib/match-api"
import { serverAPIUtils } from "@/lib/server-api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get("id")
  const type = searchParams.get("type") // 'live', 'stats', 'today'

  const apiKey = request.headers.get("X-API-Key")
  if (apiKey && !serverAPIUtils.validateApiKey(apiKey, "anonymous")) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  try {
    if (matchId && type === "stats") {
      // Get match statistics
      const stats = await matchAPI.getMatchStats(Number.parseInt(matchId))
      if (!stats || stats.length === 0) {
        return NextResponse.json({ error: "Match stats not found" }, { status: 404 })
      }
      return NextResponse.json(stats)
    } else if (type === "live") {
      // Get live matches
      const matches = await matchAPI.getLiveMatches()
      return NextResponse.json(matches)
    } else if (type === "today") {
      const matches = await matchAPI.getTodayMatches()
      return NextResponse.json(matches)
    } else {
      return NextResponse.json(
        { error: "Invalid request parameters. Use type: 'live', 'stats', or 'today'" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("HLTV API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key")
    if (apiKey && !serverAPIUtils.validateApiKey(apiKey, "anonymous")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === "refresh") {
      // Принудительно обновляем данные
      const matches = await matchAPI.getLiveMatches()
      return NextResponse.json({ success: true, matches })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
