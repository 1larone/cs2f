// config.js
module.exports = {
  GRID_BASE_URL: "https://api.grid.gg",
  GRID_TOKEN: process.env.GRID_API_KEY, // using environment variable instead of hardcoded token
  // Шаблоны endpoints (замени по документации GRID, если известны)
  gridEndpoints: {
    // пример шаблонов — заменяй на реальные из docs.grid.is
    ranking: "/v1/teams?game=cs2&ranking=valve&limit=50",
    teamById: "/v1/teams/{team_id}", // возвращает roster / logo
    playerById: "/v1/players/{player_id}", // возвращает статы игрока
  },
  fallback: {
    // fallback: URL страницы с Valve ranking (если GRID недоступен)
    valveRankingPage: "https://blast.tv/cs/valve-rankings",
  },
  outputDir: "./data",
  rateLimitMs: 500, // min time between запросами
  cacheTtlSec: 24 * 3600, // кэш результатов (сек) - 24 часа
}
