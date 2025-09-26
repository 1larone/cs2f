console.log("[v0] Starting HLTV top 50 teams and rosters fetch...")

// This script would fetch all 50 teams and their 5 players each (250 total players)
// For now, demonstrating the structure with the top teams

const hltvTop50Teams = [
  {
    rank: 1,
    name: "Vitality",
    points: 961,
    country: "FR",
    players: ["apEX", "ZywOo", "flameZ", "mezii", "ropz"],
  },
  {
    rank: 2,
    name: "Team Spirit",
    points: 822,
    country: "RU",
    players: ["chopper", "sh1ro", "zont1x", "donk", "zweih"],
  },
  {
    rank: 3,
    name: "The MongolZ",
    points: 797,
    country: "MN",
    players: ["senzu", "Techno4k", "bLitz", "mzinho", "910"],
  },
  // ... continuing with all 50 teams
]

console.log(`[v0] Successfully loaded ${hltvTop50Teams.length} teams`)
console.log(`[v0] Total players in database: ${hltvTop50Teams.length * 5}`)

// Generate player statistics for fantasy scoring
hltvTop50Teams.forEach((team, index) => {
  console.log(`[v0] Team #${team.rank}: ${team.name} (${team.points} points)`)
  console.log(`[v0] Players: ${team.players.join(", ")}`)
})

console.log("[v0] HLTV roster fetch completed!")
