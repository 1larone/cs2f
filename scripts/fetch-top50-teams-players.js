import { gridAPIClient } from "../lib/grid-api-client.js"
import fs from "fs"
import path from "path"

const ROLES = ["AWP", "Entry", "Rifler", "Support", "IGL"]
const COUNTRIES = {
  "Natus Vincere": "UA",
  "FaZe Clan": "EU",
  "Team Vitality": "FR",
  Astralis: "DK",
  "G2 Esports": "EU",
  "Team Spirit": "RU",
  MOUZ: "DE",
  Heroic: "DK",
  Cloud9: "US",
  FURIA: "BR",
  Liquid: "US",
  NIP: "SE",
  BIG: "DE",
  Complexity: "US",
  ENCE: "FI",
  Fnatic: "SE",
  OG: "EU",
  "Eternal Fire": "TR",
  "paiN Gaming": "BR",
  Imperial: "BR",
  MIBR: "BR",
  Fluxo: "BR",
  Monte: "UA",
  GamerLegion: "DE",
  SAW: "PT",
  Apeks: "NO",
  Falcons: "SA",
  "The MongolZ": "MN",
  "Lynn Vision": "CN",
  TYLOO: "CN",
  "Rare Atom": "CN",
  FlyQuest: "AU",
  Rooster: "AU",
  ORDER: "AU",
  Grayhound: "AU",
  Renegades: "AU",
  "Bad News Eagles": "XK",
  Sangal: "TR",
  ECSTATIC: "DK",
  "Into the Breach": "GB",
  "Passion UA": "UA",
  AMKAL: "RU",
  Aurora: "RU",
  Nemiga: "BY",
  B8: "UA",
  SINNERS: "CZ",
  Permitta: "EE",
  "ALTERNATE aTTaX": "DE",
  Sashi: "DK",
}

function generatePlayerStats(teamRank, role) {
  // Base stats based on team ranking (1-50)
  const tierMultiplier = teamRank <= 10 ? 1.0 : teamRank <= 25 ? 0.85 : 0.7

  // Role-specific stat adjustments
  const roleStats = {
    AWP: { rating: 1.25, adr: 82, kd: 1.28, price: 8500 },
    Entry: { rating: 1.18, adr: 78, kd: 1.22, price: 7500 },
    Rifler: { rating: 1.2, adr: 76, kd: 1.24, price: 7800 },
    Support: { rating: 1.12, adr: 70, kd: 1.16, price: 6800 },
    IGL: { rating: 1.08, adr: 68, kd: 1.12, price: 6200 },
  }

  const baseStats = roleStats[role]
  const variance = 0.1 + Math.random() * 0.15

  return {
    rating: Math.round(baseStats.rating * tierMultiplier * (0.9 + variance) * 100) / 100,
    rating30: Math.round(baseStats.rating * tierMultiplier * (0.95 + variance) * 100) / 100,
    kd: Math.round(baseStats.kd * tierMultiplier * (0.9 + variance) * 100) / 100,
    adr: Math.round(baseStats.adr * tierMultiplier * (0.9 + variance)),
    matches: Math.floor(30 + Math.random() * 20),
    kast: Math.round((68 + Math.random() * 12) * 10) / 10,
    impact: Math.round(baseStats.rating * tierMultiplier * (0.9 + variance) * 100) / 100,
    openingKills: Math.round((0.12 + Math.random() * 0.15) * 100) / 100,
    openingDeaths: Math.round((0.1 + Math.random() * 0.1) * 100) / 100,
    clutchSuccess: Math.round((25 + Math.random() * 20) * 10) / 10,
    multiKillRounds: Math.round((6 + Math.random() * 8) * 10) / 10,
    utilityDamage: Math.round((6 + Math.random() * 8) * 10) / 10,
    enemiesFlashed: Math.round((2 + Math.random() * 4) * 10) / 10,
    flashAssists: Math.round((0.05 + Math.random() * 0.15) * 100) / 100,
    supportRounds: Math.round((15 + Math.random() * 20) * 10) / 10,
    awpKillsPerRound:
      role === "AWP"
        ? Math.round((0.7 + Math.random() * 0.2) * 100) / 100
        : Math.round(Math.random() * 0.15 * 100) / 100,
    entrySuccess: Math.round((50 + Math.random() * 25) * 10) / 10,
    tradingSuccess: Math.round((65 + Math.random() * 20) * 10) / 10,
    clutchAttempts: Math.floor(12 + Math.random() * 20),
    firstKillsInRound: Math.round((0.1 + Math.random() * 0.2) * 100) / 100,
    survivalRate: Math.round((45 + Math.random() * 20) * 10) / 10,
    price: Math.round(baseStats.price * tierMultiplier * (0.8 + variance)),
  }
}

function getTier(teamRank) {
  if (teamRank <= 15) return "Tier1"
  if (teamRank <= 35) return "Tier2"
  return "Tier3"
}

async function fetchTop50TeamsAndPlayers() {
  try {
    console.log("[v0] Starting comprehensive data collection for top 50 teams...")

    // Get teams from GRID API
    const teamsResponse = await gridAPIClient.getTeams()
    console.log("[v0] Fetched teams from GRID API:", teamsResponse.length)

    // Get players from GRID API
    const playersResponse = await gridAPIClient.getPlayers()
    console.log("[v0] Fetched players from GRID API:", playersResponse.data.length)

    const allPlayers = []
    let playerId = 1

    // Process top 50 teams (or available teams)
    const topTeams = teamsResponse.slice(0, 50)

    for (let teamIndex = 0; teamIndex < topTeams.length; teamIndex++) {
      const team = topTeams[teamIndex]
      const teamRank = teamIndex + 1
      const teamName = team.name
      const teamLogo =
        team.image_url || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(teamName + " logo")}`

      console.log(`[v0] Processing team ${teamRank}: ${teamName}`)

      // Find players for this team from GRID API data
      const teamPlayers = playersResponse.data.filter(
        (player) => player.team && player.team.toLowerCase().includes(teamName.toLowerCase().split(" ")[0]),
      )

      // If we don't have enough players from API, generate them
      const playersNeeded = Math.max(5 - teamPlayers.length, 0)
      const generatedPlayers = []

      for (let i = 0; i < playersNeeded; i++) {
        generatedPlayers.push({
          id: `generated_${teamIndex}_${i}`,
          name: `Player${i + 1}`,
          team: teamName,
        })
      }

      const allTeamPlayers = [...teamPlayers, ...generatedPlayers].slice(0, 5)

      // Assign roles to players
      const shuffledRoles = [...ROLES].sort(() => Math.random() - 0.5)

      allTeamPlayers.forEach((player, playerIndex) => {
        const role = shuffledRoles[playerIndex] || "Rifler"
        const stats = generatePlayerStats(teamRank, role)
        const country = COUNTRIES[teamName] || "XX"

        const fantasyPlayer = {
          id: playerId.toString(),
          nickname: player.name,
          realName: `${player.name} RealName`,
          photo:
            player.image_url ||
            `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(player.name + " CS2 player")}`,
          role,
          tier: getTier(teamRank),
          price: stats.price,
          team: teamName,
          teamLogo,
          stats: {
            rating: stats.rating,
            rating30: stats.rating30,
            kd: stats.kd,
            adr: stats.adr,
            matches: stats.matches,
            kast: stats.kast,
            impact: stats.impact,
            openingKills: stats.openingKills,
            openingDeaths: stats.openingDeaths,
            clutchSuccess: stats.clutchSuccess,
            multiKillRounds: stats.multiKillRounds,
            utilityDamage: stats.utilityDamage,
            enemiesFlashed: stats.enemiesFlashed,
            flashAssists: stats.flashAssists,
            supportRounds: stats.supportRounds,
            awpKillsPerRound: stats.awpKillsPerRound,
            entrySuccess: stats.entrySuccess,
            tradingSuccess: stats.tradingSuccess,
            clutchAttempts: stats.clutchAttempts,
            firstKillsInRound: stats.firstKillsInRound,
            survivalRate: stats.survivalRate,
          },
          hltvId: Number.parseInt(player.id) || Math.floor(Math.random() * 50000),
          country,
        }

        allPlayers.push(fantasyPlayer)
        playerId++
      })
    }

    console.log(`[v0] Generated ${allPlayers.length} players from ${topTeams.length} teams`)

    // Update mock-data.ts with new players
    const mockDataPath = path.join(process.cwd(), "lib", "mock-data.ts")

    const newMockData = `import type { Player } from "@/types/player"

export const mockPlayers: Player[] = ${JSON.stringify(allPlayers, null, 2)}

export const roleIcons = {
  AWP: "🎯",
  Entry: "⚡",
  Rifler: "🔫",
  Support: "🛡️",
  IGL: "👑",
}

export const tierColors = {
  Tier1: "text-yellow-400",
  Tier2: "text-gray-300",
  Tier3: "text-orange-400",
}
`

    fs.writeFileSync(mockDataPath, newMockData)
    console.log(`[v0] Successfully updated mock-data.ts with ${allPlayers.length} players from top 50 teams!`)

    // Generate summary
    const teamCounts = {}
    const tierCounts = { Tier1: 0, Tier2: 0, Tier3: 0 }
    const roleCounts = { AWP: 0, Entry: 0, Rifler: 0, Support: 0, IGL: 0 }

    allPlayers.forEach((player) => {
      teamCounts[player.team] = (teamCounts[player.team] || 0) + 1
      tierCounts[player.tier]++
      roleCounts[player.role]++
    })

    console.log("\n[v0] === DATA COLLECTION SUMMARY ===")
    console.log(`Total Players: ${allPlayers.length}`)
    console.log(`Total Teams: ${Object.keys(teamCounts).length}`)
    console.log(`Tier Distribution: Tier1: ${tierCounts.Tier1}, Tier2: ${tierCounts.Tier2}, Tier3: ${tierCounts.Tier3}`)
    console.log(
      `Role Distribution: AWP: ${roleCounts.AWP}, Entry: ${roleCounts.Entry}, Rifler: ${roleCounts.Rifler}, Support: ${roleCounts.Support}, IGL: ${roleCounts.IGL}`,
    )
    console.log("=================================\n")

    return {
      success: true,
      playersAdded: allPlayers.length,
      teamsProcessed: topTeams.length,
    }
  } catch (error) {
    console.error("[v0] Error fetching teams and players:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Run the script
fetchTop50TeamsAndPlayers()
  .then((result) => {
    if (result.success) {
      console.log(
        `[v0] ✅ Successfully added ${result.playersAdded} players from ${result.teamsProcessed} teams to the fantasy game!`,
      )
    } else {
      console.log(`[v0] ❌ Failed to fetch data: ${result.error}`)
    }
  })
  .catch((error) => {
    console.error("[v0] Script execution failed:", error)
  })
