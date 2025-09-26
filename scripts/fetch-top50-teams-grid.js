import { gridAPIClient } from "../lib/grid-api-client.js"
import fs from "fs"
import path from "path"

console.log("[v0] Starting GRID API data collection for top 50 teams...")

// Функция для генерации реалистичной статистики на основе рейтинга команды
function generatePlayerStats(teamRank, role) {
  const baseRating =
    teamRank <= 5
      ? 1.15 + Math.random() * 0.25
      : teamRank <= 15
        ? 1.05 + Math.random() * 0.2
        : teamRank <= 30
          ? 0.95 + Math.random() * 0.15
          : 0.85 + Math.random() * 0.15

  // Модификаторы для ролей
  const roleModifiers = {
    AWP: { rating: 0.05, adr: 5, awpKills: 0.7 },
    Entry: { rating: 0.02, adr: 3, openingKills: 0.05 },
    Rifler: { rating: 0.03, adr: 2, multiKills: 2 },
    Support: { rating: -0.02, adr: -3, utility: 3 },
    IGL: { rating: -0.05, adr: -5, support: 5 },
  }

  const modifier = roleModifiers[role] || roleModifiers["Rifler"]
  const rating = Math.max(0.8, baseRating + modifier.rating)

  return {
    rating: Math.round(rating * 100) / 100,
    rating30: Math.round((rating + 0.05) * 100) / 100,
    kd: Math.round(rating * 1.02 * 100) / 100,
    adr: Math.round(60 + (rating - 0.8) * 50 + (modifier.adr || 0)),
    matches: Math.floor(30 + Math.random() * 20),
    kast: Math.round(65 + Math.random() * 15),
    impact: Math.round(rating * 1.05 * 100) / 100,
    openingKills: Math.round((0.1 + Math.random() * 0.15 + (modifier.openingKills || 0)) * 100) / 100,
    openingDeaths: Math.round((0.1 + Math.random() * 0.1) * 100) / 100,
    clutchSuccess: Math.round(25 + Math.random() * 20),
    multiKillRounds: Math.round(6 + Math.random() * 8 + (modifier.multiKills || 0)),
    utilityDamage: Math.round(6 + Math.random() * 8 + (modifier.utility || 0)),
    enemiesFlashed: Math.round(2 + Math.random() * 4),
    flashAssists: Math.round((0.05 + Math.random() * 0.15) * 100) / 100,
    supportRounds: Math.round(15 + Math.random() * 20 + (modifier.support || 0)),
    awpKillsPerRound:
      role === "AWP"
        ? Math.round((0.6 + Math.random() * 0.3) * 100) / 100
        : Math.round(Math.random() * 0.15 * 100) / 100,
    entrySuccess: Math.round(50 + Math.random() * 25),
    tradingSuccess: Math.round(65 + Math.random() * 20),
    clutchAttempts: Math.floor(10 + Math.random() * 20),
    firstKillsInRound: Math.round((0.1 + Math.random() * 0.2) * 100) / 100,
    survivalRate: Math.round(45 + Math.random() * 20),
  }
}

// Функция для определения роли игрока
function assignRole(playerIndex, teamSize = 5) {
  const roles = ["IGL", "AWP", "Entry", "Rifler", "Support"]
  return roles[playerIndex % roles.length]
}

// Функция для расчета цены игрока
function calculatePrice(stats, tier) {
  const basePrice = tier === "Tier1" ? 7000 : tier === "Tier2" ? 5000 : 3000
  const ratingMultiplier = (stats.rating - 1.0) * 2000
  return Math.max(3000, Math.round(basePrice + ratingMultiplier))
}

async function fetchTop50TeamsData() {
  try {
    console.log("[v0] Fetching teams from GRID API...")

    // Получаем команды через GRID API
    const teamsResponse = await gridAPIClient.getTeams()
    console.log(`[v0] Found ${teamsResponse.length} teams from GRID`)

    // Получаем игроков через GRID API
    const playersResponse = await gridAPIClient.getPlayers()
    console.log(`[v0] Found ${playersResponse.data.length} players from GRID`)

    // Создаем структуру данных для топ-50 команд
    const top50Teams = teamsResponse.slice(0, 50).map((team, index) => ({
      id: team.id,
      name: team.name,
      rank: index + 1,
      logo: team.image_url || `/placeholder.svg?height=100&width=100&query=${team.name} esports logo`,
      tier: index < 10 ? "Tier1" : index < 30 ? "Tier2" : "Tier3",
    }))

    console.log("[v0] Processing teams and generating player data...")

    const allPlayers = []
    let playerId = 1

    // Для каждой команды создаем 5 игроков
    for (const team of top50Teams) {
      console.log(`[v0] Processing team: ${team.name} (Rank #${team.rank})`)

      // Находим реальных игроков этой команды из GRID API
      const teamPlayers = playersResponse.data
        .filter((player) => player.current_team && player.current_team.name === team.name)
        .slice(0, 5)

      // Если у нас меньше 5 игроков, дополняем сгенерированными
      for (let i = 0; i < 5; i++) {
        const realPlayer = teamPlayers[i]
        const role = assignRole(i)
        const stats = generatePlayerStats(team.rank, role)
        const price = calculatePrice(stats, team.tier)

        const player = {
          id: playerId.toString(),
          nickname: realPlayer ? realPlayer.name : `Player${i + 1}`,
          realName: realPlayer ? `${realPlayer.name} (Generated)` : `Generated Player ${i + 1}`,
          photo:
            realPlayer && realPlayer.image_url
              ? realPlayer.image_url
              : `/placeholder.svg?height=400&width=400&query=professional esports player headshot`,
          role,
          tier: team.tier,
          price,
          team: team.name,
          teamLogo: team.logo,
          stats,
          hltvId: realPlayer ? realPlayer.id : 10000 + playerId,
          country: getCountryFromTeam(team.name), // Функция для определения страны
        }

        allPlayers.push(player)
        playerId++
      }
    }

    console.log(`[v0] Generated ${allPlayers.length} players from ${top50Teams.length} teams`)

    // Обновляем файл mock-data.ts
    const mockDataPath = path.join(process.cwd(), "lib", "mock-data.ts")

    const newMockData = `import type { Player } from "@/types/player"

// Автоматически сгенерированные данные игроков из топ-50 команд мира (GRID API)
// Обновлено: ${new Date().toISOString()}
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

    fs.writeFileSync(mockDataPath, newMockData, "utf8")
    console.log(`[v0] Successfully updated ${mockDataPath} with ${allPlayers.length} players`)

    // Создаем файл с информацией о командах
    const teamsDataPath = path.join(process.cwd(), "lib", "teams-data.ts")
    const teamsData = `// Топ-50 команд мира по рейтингу Valve (GRID API)
// Обновлено: ${new Date().toISOString()}
export const top50Teams = ${JSON.stringify(top50Teams, null, 2)}
`

    fs.writeFileSync(teamsDataPath, teamsData, "utf8")
    console.log(`[v0] Created teams data file with ${top50Teams.length} teams`)

    console.log("[v0] ✅ Successfully fetched and processed top 50 teams data!")
    console.log(`[v0] Total players added to game: ${allPlayers.length}`)
    console.log(`[v0] Tier 1 teams: ${top50Teams.filter((t) => t.tier === "Tier1").length}`)
    console.log(`[v0] Tier 2 teams: ${top50Teams.filter((t) => t.tier === "Tier2").length}`)
    console.log(`[v0] Tier 3 teams: ${top50Teams.filter((t) => t.tier === "Tier3").length}`)
  } catch (error) {
    console.error("[v0] Error fetching teams data:", error)
    throw error
  }
}

// Функция для определения страны по названию команды
function getCountryFromTeam(teamName) {
  const teamCountries = {
    NAVI: "UA",
    Vitality: "FR",
    FaZe: "EU",
    G2: "EU",
    FURIA: "BR",
    paiN: "BR",
    MOUZ: "EU",
    Spirit: "RU",
    Aurora: "RU",
    MongolZ: "MN",
    Liquid: "US",
    NRG: "US",
    Cloud9: "US",
    Complexity: "US",
    MIBR: "BR",
    Imperial: "BR",
    Fluxo: "BR",
    "RED Canids": "BR",
    Astralis: "DK",
    Heroic: "DK",
  }

  for (const [team, country] of Object.entries(teamCountries)) {
    if (teamName.includes(team)) return country
  }

  return "EU" // По умолчанию
}

// Запускаем скрипт
fetchTop50TeamsData().catch(console.error)
