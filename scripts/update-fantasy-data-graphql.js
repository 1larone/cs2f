import { gridGraphQLClient } from "../lib/grid-graphql-client.js"
import { gridAPIClient } from "../lib/grid-api-client.js"
import fs from "fs"
import path from "path"

console.log("[v0] Starting GraphQL-enhanced fantasy data update...")

async function updateFantasyDataWithGraphQL() {
  try {
    console.log("\n=== Fetching Enhanced Fantasy Data ===")

    // Get recent series and fantasy data
    const series = await gridGraphQLClient.getSeries(10)
    console.log(`[v0] Found ${series.length} recent series`)

    const fantasyData = await gridGraphQLClient.getFantasyData(10)
    console.log(`[v0] Collected ${fantasyData.length} player performances`)

    const playerAverages = await gridGraphQLClient.getPlayerAverages()
    console.log(`[v0] Calculated averages for ${playerAverages.size} players`)

    // Get traditional API data for comparison
    const playersResponse = await gridAPIClient.getPlayersWithFantasyStats()
    const enhancedPlayers = playersResponse.success ? playersResponse.data : []
    console.log(`[v0] Enhanced ${enhancedPlayers.length} players with fantasy stats`)

    console.log("\n=== Processing Data ===")

    // Create comprehensive fantasy dataset
    const fantasyDataset = {
      metadata: {
        generatedAt: new Date().toISOString(),
        source: "GRID_GraphQL_Enhanced",
        totalSeries: series.length,
        totalPerformances: fantasyData.length,
        uniquePlayers: playerAverages.size,
        dataVersion: "2.0",
      },

      // Recent performances (last 10 series)
      recentPerformances: fantasyData.map((perf) => ({
        playerId: perf.playerId,
        nickname: perf.nickname,
        kills: perf.kills,
        deaths: perf.deaths,
        assists: perf.assists,
        adr: perf.adr,
        clutches: perf.clutches,
        mvps: perf.mvps,
        entryDuelsWon: perf.entryDuelsWon,
        entryDuelsLost: perf.entryDuelsLost,
        fantasyPoints: perf.fantasyPoints,
        kd: (perf.kills / Math.max(1, perf.deaths)).toFixed(2),
        performanceGrade: getPerformanceGrade(perf.fantasyPoints),
      })),

      // Player averages
      playerAverages: Array.from(playerAverages.values()).map((avg) => ({
        playerId: avg.playerId,
        nickname: avg.nickname,
        avgKills: avg.kills,
        avgDeaths: avg.deaths,
        avgAssists: avg.assists,
        avgADR: avg.adr,
        avgClutches: avg.clutches,
        avgMVPs: avg.mvps,
        avgEntryDuelsWon: avg.entryDuelsWon,
        avgEntryDuelsLost: avg.entryDuelsLost,
        avgFantasyPoints: avg.fantasyPoints,
        avgKD: (avg.kills / Math.max(1, avg.deaths)).toFixed(2),
        tier: getPlayerTier(avg.fantasyPoints),
        consistency: calculateConsistency(avg.playerId, fantasyData),
      })),

      // Top performers by category
      topPerformers: {
        byFantasyPoints: Array.from(playerAverages.values())
          .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
          .slice(0, 10)
          .map((p) => ({ nickname: p.nickname, avgPoints: p.fantasyPoints })),

        byKD: Array.from(playerAverages.values())
          .sort((a, b) => b.kills / Math.max(1, b.deaths) - a.kills / Math.max(1, a.deaths))
          .slice(0, 10)
          .map((p) => ({ nickname: p.nickname, kd: (p.kills / Math.max(1, p.deaths)).toFixed(2) })),

        byADR: Array.from(playerAverages.values())
          .sort((a, b) => b.adr - a.adr)
          .slice(0, 10)
          .map((p) => ({ nickname: p.nickname, adr: p.adr })),

        byClutches: Array.from(playerAverages.values())
          .sort((a, b) => b.clutches - a.clutches)
          .slice(0, 10)
          .map((p) => ({ nickname: p.nickname, avgClutches: p.clutches })),
      },

      // Recent series info
      recentSeries: series.map((s) => ({
        id: s.id,
        tournament: s.tournament.name,
        teams: s.teams.map((t) => t.name),
        matchCount: 0, // Would need additional query to get match count
      })),

      // Statistics
      statistics: {
        averageFantasyPoints: (
          Array.from(playerAverages.values()).reduce((sum, p) => sum + p.fantasyPoints, 0) / playerAverages.size
        ).toFixed(2),
        averageKD: (
          Array.from(playerAverages.values()).reduce((sum, p) => sum + p.kills / Math.max(1, p.deaths), 0) /
          playerAverages.size
        ).toFixed(2),
        averageADR: (
          Array.from(playerAverages.values()).reduce((sum, p) => sum + p.adr, 0) / playerAverages.size
        ).toFixed(1),
        totalClutches: fantasyData.reduce((sum, p) => sum + p.clutches, 0),
        totalMVPs: fantasyData.reduce((sum, p) => sum + p.mvps, 0),
        tierDistribution: {
          elite: Array.from(playerAverages.values()).filter((p) => p.fantasyPoints > 20).length,
          professional: Array.from(playerAverages.values()).filter((p) => p.fantasyPoints > 15 && p.fantasyPoints <= 20)
            .length,
          competitive: Array.from(playerAverages.values()).filter((p) => p.fantasyPoints > 10 && p.fantasyPoints <= 15)
            .length,
          developing: Array.from(playerAverages.values()).filter((p) => p.fantasyPoints <= 10).length,
        },
      },
    }

    console.log("\n=== Saving Enhanced Data ===")

    // Save comprehensive fantasy data
    const fantasyDataPath = path.join(process.cwd(), "lib", "enhanced-fantasy-data.ts")
    const fantasyDataContent = `// Auto-generated GraphQL enhanced fantasy data
// Generated: ${new Date().toISOString()}
// Source: GRID GraphQL API

export const ENHANCED_FANTASY_DATA = ${JSON.stringify(fantasyDataset, null, 2)} as const

export type EnhancedFantasyData = typeof ENHANCED_FANTASY_DATA
export type PlayerPerformance = typeof ENHANCED_FANTASY_DATA.recentPerformances[0]
export type PlayerAverage = typeof ENHANCED_FANTASY_DATA.playerAverages[0]
export type TopPerformer = typeof ENHANCED_FANTASY_DATA.topPerformers.byFantasyPoints[0]

// Helper functions
export function getPlayerByNickname(nickname: string) {
  return ENHANCED_FANTASY_DATA.playerAverages.find(p => p.nickname === nickname)
}

export function getTopPerformersByCategory(category: keyof typeof ENHANCED_FANTASY_DATA.topPerformers) {
  return ENHANCED_FANTASY_DATA.topPerformers[category]
}

export function getPlayerTierDistribution() {
  return ENHANCED_FANTASY_DATA.statistics.tierDistribution
}

export function getRecentPerformances(limit = 20) {
  return ENHANCED_FANTASY_DATA.recentPerformances
    .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
    .slice(0, limit)
}
`

    fs.writeFileSync(fantasyDataPath, fantasyDataContent, "utf8")
    console.log(`[v0] ✅ Enhanced fantasy data saved to: ${fantasyDataPath}`)

    // Update the existing mock data with enhanced information
    const mockDataPath = path.join(process.cwd(), "lib", "mock-data.ts")
    if (fs.existsSync(mockDataPath)) {
      const existingContent = fs.readFileSync(mockDataPath, "utf8")
      const enhancedContent =
        existingContent +
        `

// GraphQL Enhanced Data Integration
import { ENHANCED_FANTASY_DATA } from "./enhanced-fantasy-data"

export function getEnhancedPlayerData(playerId: string) {
  const averages = ENHANCED_FANTASY_DATA.playerAverages.find(p => p.playerId === playerId)
  const recentPerfs = ENHANCED_FANTASY_DATA.recentPerformances.filter(p => p.playerId === playerId)
  
  return {
    averages,
    recentPerformances: recentPerfs,
    performanceCount: recentPerfs.length
  }
}

`

      fs.writeFileSync(mockDataPath, enhancedContent, "utf8")
      console.log(`[v0] ✅ Enhanced mock data with GraphQL integration`)
    }

    // Generate summary report
    console.log("\n=== Summary Report ===")
    console.log(`📊 Total Series Analyzed: ${series.length}`)
    console.log(`🎮 Player Performances: ${fantasyData.length}`)
    console.log(`👥 Unique Players: ${playerAverages.size}`)
    console.log(`⭐ Elite Players (20+ avg): ${fantasyDataset.statistics.tierDistribution.elite}`)
    console.log(
      `🏆 Top Performer: ${fantasyDataset.topPerformers.byFantasyPoints[0]?.nickname} (${fantasyDataset.topPerformers.byFantasyPoints[0]?.avgPoints.toFixed(1)} pts)`,
    )
    console.log(`📈 Average Fantasy Points: ${fantasyDataset.statistics.averageFantasyPoints}`)
    console.log(`🎯 Average K/D: ${fantasyDataset.statistics.averageKD}`)
    console.log(`💥 Average ADR: ${fantasyDataset.statistics.averageADR}`)

    console.log("\n✅ GraphQL-enhanced fantasy data update completed successfully!")
  } catch (error) {
    console.error("[v0] ❌ Fantasy data update failed:", error)
    throw error
  }
}

// Helper functions
function getPerformanceGrade(points) {
  if (points > 25) return "S+"
  if (points > 20) return "S"
  if (points > 15) return "A"
  if (points > 10) return "B"
  if (points > 5) return "C"
  return "D"
}

function getPlayerTier(avgPoints) {
  if (avgPoints > 20) return "Elite"
  if (avgPoints > 15) return "Professional"
  if (avgPoints > 10) return "Competitive"
  return "Developing"
}

function calculateConsistency(playerId, allPerformances) {
  const playerPerfs = allPerformances.filter((p) => p.playerId === playerId)
  if (playerPerfs.length < 2) return 0

  const points = playerPerfs.map((p) => p.fantasyPoints)
  const avg = points.reduce((sum, p) => sum + p, 0) / points.length
  const variance = points.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / points.length
  const stdDev = Math.sqrt(variance)

  // Lower standard deviation = higher consistency (inverted and normalized)
  return Math.max(0, 100 - stdDev * 5)
}

// Run the updater
updateFantasyDataWithGraphQL().catch(console.error)
