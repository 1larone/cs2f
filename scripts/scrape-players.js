import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, "../data"),
  logFile: path.join(__dirname, "logs/scraper.log"),
  rateLimit: 1000, // ms between requests
  maxRetries: 3,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

// Logging function
function log(message, level = "INFO") {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level}] ${message}`
  console.log(logMessage)
}

// Rate limiting
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock data for top 50 teams (in real implementation, this would be scraped)
const TOP_TEAMS = [
  { name: "Team Spirit", players: ["sh1ro", "donk", "magixx", "zont1x", "chopper"] },
  { name: "NAVI", players: ["iM", "jL", "Aleksib", "b1t", "w0nderful"] },
  { name: "G2", players: ["m0NESY", "NiKo", "huNter-", "nexa", "malbs"] },
  { name: "Vitality", players: ["ZywOo", "flameZ", "Spinx", "mezii", "apEX"] },
  { name: "MOUZ", players: ["torzsi", "xertioN", "Brollan", "siuhy", "Jimpphat"] },
  { name: "FaZe", players: ["broky", "ropz", "rain", "karrigan", "frozen"] },
  { name: "Eternal Fire", players: ["woxic", "XANTARES", "Calyx", "MAJ3R", "imoRR"] },
  { name: "Astralis", players: ["device", "stavn", "jabbi", "blameF", "Staehr"] },
  { name: "Complexity", players: ["EliGE", "floppy", "hallzerk", "JT", "Grim"] },
  { name: "Liquid", players: ["YEKINDAR", "NAF", "Twistzz", "ultimate", "cadiaN"] },
]

// Player roles mapping
const PLAYER_ROLES = {
  sh1ro: "AWP",
  donk: "Rifler",
  iM: "Entry",
  m0NESY: "AWP",
  NiKo: "Rifler",
  ZywOo: "AWP",
  torzsi: "AWP",
  broky: "AWP",
  device: "AWP",
  EliGE: "Entry",
  // Add more mappings as needed
}

// Generate mock statistics for a player
function generatePlayerStats(playerName, teamName) {
  const baseRating = Math.random() * 0.4 + 0.8 // 0.8 - 1.2
  const tier = baseRating > 1.1 ? "Tier1" : baseRating > 0.95 ? "Tier2" : "Tier3"

  return {
    id: `${playerName.toLowerCase()}_${teamName.toLowerCase().replace(/\s+/g, "_")}`,
    name: playerName,
    team: teamName,
    role: PLAYER_ROLES[playerName] || "Rifler",
    tier: tier,
    rating: Math.round(baseRating * 100) / 100,
    kd: Math.round((baseRating * 1.1 + Math.random() * 0.2) * 100) / 100,
    adr: Math.round(baseRating * 80 + Math.random() * 20),
    kast: Math.round((baseRating * 0.7 + 0.2 + Math.random() * 0.1) * 100),
    impact: Math.round(baseRating * 1.2 * 100) / 100,
    price: Math.round(baseRating * 10 + Math.random() * 5),
    photoUrl: `https://img-cdn.hltv.org/playerbodyshot/${playerName.toLowerCase()}.png`,
    lastUpdated: new Date().toISOString(),
  }
}

// Main scraping function
async function scrapePlayersData() {
  try {
    log("Starting player data scraping...")

    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true })

    const allPlayers = []
    const teams = []

    for (const team of TOP_TEAMS) {
      log(`Processing team: ${team.name}`)

      const teamData = {
        name: team.name,
        players: team.players,
        logoUrl: `/teams/${team.name.toLowerCase().replace(/\s+/g, "_")}.png`,
      }

      teams.push(teamData)

      for (const playerName of team.players) {
        log(`Processing player: ${playerName} from ${team.name}`)

        const playerData = generatePlayerStats(playerName, team.name)
        allPlayers.push(playerData)

        // Rate limiting
        await delay(CONFIG.rateLimit)
      }
    }

    // Save data to JSON files
    const playersFile = path.join(CONFIG.outputDir, "players.json")
    const teamsFile = path.join(CONFIG.outputDir, "teams.json")

    await fs.writeFile(playersFile, JSON.stringify(allPlayers, null, 2))
    await fs.writeFile(teamsFile, JSON.stringify(teams, null, 2))

    log(`Successfully scraped ${allPlayers.length} players from ${teams.length} teams`)
    log(`Data saved to: ${playersFile} and ${teamsFile}`)

    return { players: allPlayers, teams: teams }
  } catch (error) {
    log(`Error during scraping: ${error.message}`, "ERROR")
    throw error
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapePlayersData()
    .then((data) => {
      log("Scraping completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      log(`Scraping failed: ${error.message}`, "ERROR")
      process.exit(1)
    })
}

export { scrapePlayersData }
