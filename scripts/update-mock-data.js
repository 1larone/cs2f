import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function updateMockData() {
  try {
    console.log("Updating mock data from scraped players...")

    // Read scraped data
    const playersFile = path.join(__dirname, "../data/players.json")
    const teamsFile = path.join(__dirname, "../data/teams.json")

    const playersData = JSON.parse(await fs.readFile(playersFile, "utf8"))
    const teamsData = JSON.parse(await fs.readFile(teamsFile, "utf8"))

    // Generate TypeScript mock data file
    const mockDataContent = `// Auto-generated from scraped data - ${new Date().toISOString()}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'AWP' | 'Entry' | 'Rifler' | 'Support' | 'IGL';
  tier: 'Tier1' | 'Tier2' | 'Tier3';
  rating: number;
  kd: number;
  adr: number;
  kast: number;
  impact: number;
  price: number;
  photoUrl: string;
  lastUpdated: string;
}

export interface Team {
  name: string;
  players: string[];
  logoUrl: string;
}

export const mockPlayers: Player[] = ${JSON.stringify(playersData, null, 2)};

export const mockTeams: Team[] = ${JSON.stringify(teamsData, null, 2)};

// Helper functions
export function getPlayersByTeam(teamName: string): Player[] {
  return mockPlayers.filter(player => player.team === teamName);
}

export function getPlayersByTier(tier: string): Player[] {
  return mockPlayers.filter(player => player.tier === tier);
}

export function getPlayersByRole(role: string): Player[] {
  return mockPlayers.filter(player => player.role === role);
}
`

    // Write updated mock data
    const mockDataFile = path.join(__dirname, "../lib/mock-data.ts")
    await fs.writeFile(mockDataFile, mockDataContent)

    console.log(`Successfully updated mock data with ${playersData.length} players from ${teamsData.length} teams`)
    console.log(`Mock data file updated: ${mockDataFile}`)
  } catch (error) {
    console.error("Error updating mock data:", error.message)
    process.exit(1)
  }
}

// Run the updater
if (import.meta.url === `file://${process.argv[1]}`) {
  updateMockData()
}

export { updateMockData }
