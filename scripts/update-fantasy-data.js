import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function updateFantasyData() {
  try {
    console.log("Updating fantasy data from scraped JSON files...")

    const dataDir = path.join(__dirname, "../data")
    const libDir = path.join(__dirname, "../lib")

    // Read scraped data
    const playersData = JSON.parse(await fs.readFile(path.join(dataDir, "top50_players.json"), "utf8"))
    const teamsData = JSON.parse(await fs.readFile(path.join(dataDir, "top50_teams.json"), "utf8"))

    // Generate TypeScript mock data file
    const mockDataContent = `// Auto-generated from scraped data - DO NOT EDIT MANUALLY
// Last updated: ${new Date().toISOString()}

import type { Player, Team } from "../types/player"

export const MOCK_PLAYERS: Player[] = ${JSON.stringify(playersData, null, 2)}

export const MOCK_TEAMS: Team[] = ${JSON.stringify(
      teamsData.map((team) => ({
        id: team.id,
        name: team.name,
        logo: team.logo,
        country: team.country,
        ranking: team.ranking,
        players: team.players,
      })),
      null,
      2,
    )}

// Helper functions
export function getPlayersByTeam(teamName: string): Player[] {
  return MOCK_PLAYERS.filter(player => player.team === teamName)
}

export function getPlayersByTier(tier: "Tier1" | "Tier2" | "Tier3"): Player[] {
  return MOCK_PLAYERS.filter(player => player.tier === tier)
}

export function getPlayersByRole(role: "AWP" | "Entry" | "Rifler" | "Support" | "IGL"): Player[] {
  return MOCK_PLAYERS.filter(player => player.role === role)
}

export function getTopPlayersByRating(limit: number = 20): Player[] {
  return [...MOCK_PLAYERS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

export function getPlayerById(id: string): Player | undefined {
  return MOCK_PLAYERS.find(player => player.id === id)
}

export function getTeamById(id: number): Team | undefined {
  return MOCK_TEAMS.find(team => team.id === id)
}

// Statistics
export const FANTASY_STATS = {
  totalPlayers: ${playersData.length},
  totalTeams: ${teamsData.length},
  averageRating: ${(playersData.reduce((sum, p) => sum + p.rating, 0) / playersData.length).toFixed(3)},
  tierDistribution: {
    Tier1: ${playersData.filter((p) => p.tier === "Tier1").length},
    Tier2: ${playersData.filter((p) => p.tier === "Tier2").length},
    Tier3: ${playersData.filter((p) => p.tier === "Tier3").length},
  },
  roleDistribution: {
    AWP: ${playersData.filter((p) => p.role === "AWP").length},
    Entry: ${playersData.filter((p) => p.role === "Entry").length},
    Rifler: ${playersData.filter((p) => p.role === "Rifler").length},
    Support: ${playersData.filter((p) => p.role === "Support").length},
    IGL: ${playersData.filter((p) => p.role === "IGL").length},
  }
}
`

    // Write updated mock data
    await fs.writeFile(path.join(libDir, "mock-data.ts"), mockDataContent)

    console.log("Fantasy data updated successfully!")
    console.log(`Updated with ${playersData.length} players from ${teamsData.length} teams`)
  } catch (error) {
    console.error("Error updating fantasy data:", error)
    throw error
  }
}

// Run the updater
if (import.meta.url === `file://${process.argv[1]}`) {
  updateFantasyData()
    .then(() => {
      console.log("Data update completed!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Data update failed:", error)
      process.exit(1)
    })
}

export { updateFantasyData }
