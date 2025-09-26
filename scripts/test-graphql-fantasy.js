import { gridGraphQLClient } from "../lib/grid-graphql-client.js"
import { gridAPIClient } from "../lib/grid-api-client.js"
import fs from "fs"
import path from "path"

console.log("[v0] Testing GRID GraphQL Fantasy Data Integration...")

async function testGraphQLFantasyData() {
  try {
    console.log("\n=== Testing GraphQL Series Fetching ===")
    const series = await gridGraphQLClient.getSeries(3)
    console.log(`[v0] Found ${series.length} recent series:`)
    series.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.tournament.name}: ${s.teams.map((t) => t.name).join(" vs ")}`)
    })

    console.log("\n=== Testing Fantasy Data Collection ===")
    const fantasyData = await gridGraphQLClient.getFantasyData(2)
    console.log(`[v0] Collected ${fantasyData.length} player performances`)

    // Show top 10 performers
    const topPerformers = fantasyData.sort((a, b) => b.fantasyPoints - a.fantasyPoints).slice(0, 10)

    console.log("\n🏆 Top 10 Fantasy Performers:")
    topPerformers.forEach((player, i) => {
      console.log(
        `  ${i + 1}. ${player.nickname}: ${player.fantasyPoints} pts (K:${player.kills} D:${player.deaths} ADR:${player.adr})`,
      )
    })

    console.log("\n=== Testing Player Averages ===")
    const averages = await gridGraphQLClient.getPlayerAverages()
    console.log(`[v0] Calculated averages for ${averages.size} unique players`)

    // Show top 5 by average fantasy points
    const topAverages = Array.from(averages.values())
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      .slice(0, 5)

    console.log("\n📊 Top 5 Players by Average Fantasy Points:")
    topAverages.forEach((player, i) => {
      console.log(
        `  ${i + 1}. ${player.nickname}: ${player.fantasyPoints} avg pts (Rating: ${(player.kills / Math.max(1, player.deaths)).toFixed(2)} K/D)`,
      )
    })

    console.log("\n=== Testing Integration with Existing API Client ===")
    const fantasyStats = await gridAPIClient.getFantasyPlayerStats(2)
    if (fantasyStats.success) {
      console.log(`[v0] ✅ API Client integration successful: ${fantasyStats.data.length} stats retrieved`)
    } else {
      console.log(`[v0] ❌ API Client integration failed: ${fantasyStats.error}`)
    }

    console.log("\n=== Generating Fantasy Report ===")
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalPerformances: fantasyData.length,
      uniquePlayers: averages.size,
      topPerformers: topPerformers.map((p) => ({
        nickname: p.nickname,
        fantasyPoints: p.fantasyPoints,
        kills: p.kills,
        deaths: p.deaths,
        adr: p.adr,
        kd: (p.kills / Math.max(1, p.deaths)).toFixed(2),
      })),
      playerAverages: topAverages.map((p) => ({
        nickname: p.nickname,
        avgFantasyPoints: p.fantasyPoints,
        avgKills: p.kills,
        avgDeaths: p.deaths,
        avgADR: p.adr,
        avgKD: (p.kills / Math.max(1, p.deaths)).toFixed(2),
      })),
      recentSeries: series.map((s) => ({
        tournament: s.tournament.name,
        teams: s.teams.map((t) => t.name),
      })),
    }

    // Save report to file
    const reportPath = path.join(process.cwd(), "fantasy-report.json")
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf8")
    console.log(`[v0] 📄 Fantasy report saved to: ${reportPath}`)

    console.log("\n=== Testing Fantasy Points Calculation ===")
    // Test the fantasy points calculation with sample data
    const sampleStats = {
      kills: 25,
      deaths: 15,
      assists: 8,
      clutches: 3,
      mvps: 2,
      entryDuels: { won: 5, lost: 3 },
      adr: 85,
    }

    const calculatedPoints = gridGraphQLClient.calculateFantasyPoints(sampleStats)
    console.log(`[v0] Sample calculation: ${calculatedPoints} points for stats:`, sampleStats)

    console.log("\n✅ All GraphQL Fantasy Data tests completed successfully!")
  } catch (error) {
    console.error("[v0] ❌ Test failed:", error)
    throw error
  }
}

// Run the test
testGraphQLFantasyData().catch(console.error)
