config.js (изменяешь здесь)
\
// config.js
module.exports = {
  GRID_BASE_URL: "https://api.grid.gg", // <- если другая, замени на docs URL
  GRID_TOKEN: "q4i0PDOlTNVcwMRo6wF5hmDMp8V377QqFyfoPcVn", // Твой токен
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
  outputDir: "./out",
  rateLimitMs: 500, // min time between запросами
  cacheTtlSec: 24 * 3600, // кэш результатов (сек) - 24 часа
}

Основной
скрипт
scrape_grid_top50.js

Сохрани
этот
файл
как
scrape_grid_top50.js
:

// scrape_grid_top50.js
const fs = require("fs-extra")
const path = require("path")
const axios = require("axios")
\
const Bottleneck = require("bottleneck")
\
const cheerio = require(\'cheerio')
\
const config = require(\'./config')

const OUT = config.outputDir
fs.ensureDirSync(OUT)
fs.ensureDirSync(path.join(OUT, "images"))
fs.ensureDirSync(path.join(OUT, "team_logos"))
\
const limiter = new Bottleneck({ minTime: config.rateLimitMs, maxConcurrent: 1 })

// helper to GET with bearer token
async function gridGet(endpoint) {
  const url = endpoint.startsWith("http") ? endpoint : config.GRID_BASE_URL.replace(/\/$/, "") + endpoint
  try {
    const res = await limiter.schedule(() =>
      axios.get(url, {
        headers: { Authorization: `Bearer ${config.GRID_TOKEN}`, "User-Agent": "Fantasy-CS2-Scraper/1.0" },
        timeout: 20000,
      }),
    )
    return res.data
  } catch (err) {
    // bubble up but include status/message
    throw new Error(
      `GRID GET failed ${url}: ${err.response ? err.response.status + " " + err.response.statusText : err.message}`,
    )
  }
}

// fallback scraper for Valve ranking (if GRID not available)
async function fetchValveRankingFallback() {
  console.log("Using fallback: scraping public Valve ranking page...")
  const res = await limiter.schedule(() =>
    axios.get(config.fallback.valveRankingPage, { headers: { "User-Agent": "Mozilla/5.0" } }),
  )
  const $ = cheerio.load(res.data)
  // This parser is heuristic — tweak if page structure differs
  const teams = []
  $("a.team-card, .team-row, .rankingItem").each((i, el) => {
    if (teams.length >= 50) return false
    const name = $(el).find(".team-name, .title, .team-title").first().text().trim() || $(el).text().trim()
    const link = $(el).attr("href") ? $(el).attr("href") : null
    teams.push({ name, source_url: link })
  })
  // fallback: if no nodes matched, try another selector
  if (teams.length === 0) {
    // try HLTV Valve ranking page
    const alt = await axios.get("https://www.hltv.org/valve-ranking/teams", {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    const $a = cheerio.load(alt.data)
    $a(".team").each((i, el) => {
      if (teams.length >= 50) return false
      teams.push({ name: $a(el).find(".name").text().trim(), source_url: null })
    })
  }
  return teams.slice(0, 50)
}

// download media helper
async function download(url, destPath) {
  if (!url) return null
  try {
    if (await fs.pathExists(destPath)) return destPath
    const resp = await limiter.schedule(() => axios({ url, responseType: "stream", timeout: 20000 }))
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destPath)
      resp.data.pipe(writer)
      writer.on("finish", resolve)
      writer.on("error", reject)
    })
    return destPath
  } catch (err) {
    console.warn(`Failed to download ${url}: ${err.message}`)
    return null
  }
}

// role heuristics (basic)
function detectRoleFromMeta(playerMeta) {
  // if source contains role field, use it
  if (playerMeta && playerMeta.role) return playerMeta.role
  // basic placeholders — real logic should use real stats
  if (!playerMeta) return "Unknown"
  if (playerMeta.awpPercent && playerMeta.awpPercent > 30) return "AWP"
  if (playerMeta.kpr && playerMeta.kpr > 0.7) return "Entry"
  if (playerMeta.adr && playerMeta.adr > 80) return "Rifler"
  if (playerMeta.assists && playerMeta.assists > 0.8) return "Support"
  if (playerMeta.is_igL) return "IGL"
  return "Rifler"
}

// price calc
function calcPrice(tier, role, rating3) {
  const base = { tier1: 35, tier2: 15, tier3: 6 }[tier] || 10
  const roleCoeff = { AWP: 1.3, Entry: 1.25, Rifler: 1.0, Support: 0.85, IGL: 0.9 }[role] || 1.0
  const ratingFactor = rating3 ? 1 + (rating3 - 1.0) * 1.8 : 1.0
  let price = Math.round(base * roleCoeff * ratingFactor)
  if (price < 3) price = 3
  if (price > 100) price = 100
  return price
}

async function fetchTeamFromGridOrFallback(teamRef) {
  // teamRef might be an object returned from GRID or minimal from fallback
  if (teamRef.id && config.gridEndpoints.teamById) {
    const endpoint = config.gridEndpoints.teamById.replace("{team_id}", encodeURIComponent(teamRef.id))
    try {
      const teamData = await gridGet(endpoint)
      return teamData
    } catch (err) {
      console.warn("GRID team fetch failed:", err.message)
    }
  }
  // fallback: try to fetch team page via source_url if available
  if (teamRef.source_url) {
    try {
      const res = await limiter.schedule(() =>
        axios.get(teamRef.source_url, { headers: { "User-Agent": "Mozilla/5.0" } }),
      )
      // parse basic roster from HTML — heuristics
      const $ = cheerio.load(res.data)
      const players = []
      $(".roster .player, .roster .player-card, .player").each((i, el) => {
        if (players.length >= 5) return false
        const nick = $(el).find(".nick, .player-name").text().trim() || $(el).text().trim()
        const href = $(el).find("a").attr("href") || null
        // try extract player id from href (hltv like /player/1234/slug)
        let playerId = null
        if (href && href.includes("/player/")) {
          const m = href.match(/player\/(\d+)/)
          if (m) playerId = m[1]
        }
        players.push({ nickname: nick, player_id: playerId, source_url: href })
      })
      return { name: teamRef.name, logo: null, players }
    } catch (err) {
      console.warn("Fallback team page fetch failed:", err.message)
    }
  }
  return null
}

async function fetchPlayerFromGridOrFallback(playerRef) {
  // playerRef may have id or source_url
  let meta = {}
  if (playerRef.id && config.gridEndpoints.playerById) {
    const endpoint = config.gridEndpoints.playerById.replace("{player_id}", encodeURIComponent(playerRef.id))
    try {
      const data = await gridGet(endpoint)
      // map fields from GRID response to expected
      meta = {
        player_id: data.id || playerRef.id,
        nickname: data.nickname || data.name || playerRef.nickname,
        full_name: data.full_name || data.realName || null,
        rating_3: data.stats ? data.stats.rating3 : data.rating ? data.rating : null,
        kd: data.stats ? data.stats.kd : null,
        adr: data.stats ? data.stats.adr : null,
        role: data.role || null,
        photo: data.photo || data.image || null,
      }
      return meta
    } catch (err) {
      console.warn("GRID player fetch failed:", err.message)
    }
  }

  // fallback: if source_url (HLTV) available, try to parse that page (simple selectors)
  if (playerRef.source_url && playerRef.source_url.includes("hltv.org")) {
    try {
      const res = await limiter.schedule(() =>
        axios.get(playerRef.source_url, { headers: { "User-Agent": "Mozilla/5.0" } }),
      )
      const $ = cheerio.load(res.data)
      const nickname = $(".playerNickname").first().text().trim() || playerRef.nickname
      const real = $(".playerRealname").first().text().trim() || null
      const stats = {}
      $(".playerSummaryStat").each((i, el) => {
        const caption = $(el).find(".playerSummaryStatCaption").text().trim()
        const value = $(el).find(".playerSummaryStatValue").text().trim()
        stats[caption] = value
      })
      const rating3 = stats["Rating 3.0"]
        ? Number.parseFloat(stats["Rating 3.0"])
        : stats["Rating 2.0"]
          ? Number.parseFloat(stats["Rating 2.0"])
          : null
      return {
        player_id: playerRef.id || null,
        nickname,
        full_name: real,
        rating_3: rating3,
        kd: stats["K/D Ratio"] ? Number.parseFloat(stats["K/D Ratio"]) : null,
        adr: stats["ADR"] ? Number.parseFloat(stats["ADR"]) : null,
        role: null, // HLTV often doesn't give role explicitly
        photo: $(".playerImage img").attr("src") || null,
      }
    } catch (err) {
      console.warn("HLTV fallback player fetch failed:", err.message)
    }
  }

  // ultimate fallback: return what we have
  return {
    player_id: playerRef.id || null,
    nickname: playerRef.nickname || playerRef.name || null,
    full_name: null,
    rating_3: null,
    kd: null,
    adr: null,
    role: null,
    photo: null,
  }
}

async function main() {
  console.log("Start top-50 scrape (GRID primary, fallback enabled)...")
  let teamsList = null
  // 1) try GRID ranking endpoint
  try {
    if (config.gridEndpoints && config.gridEndpoints.ranking) {
      const data = await gridGet(config.gridEndpoints.ranking)
      // GRID may return {data: [...]} or [...], try common shapes
      teamsList = data && data.data ? data.data : data
      // normalize to array of {id, name, rank, source_url}
      teamsList = teamsList
        .map((t, idx) => ({
          id: t.id || t.team_id || t.slug || null,
          name: t.name || t.team_name || t.title || null,
          valve_rank: t.rank || t.valve_rank || idx + 1,
          source_url: t.url || t.link || null,
        }))
        .slice(0, 50)
      console.log(`GRID returned ${teamsList.length} teams`)
    }
  } catch (err) {
    console.warn("GRID ranking endpoint failed:", err.message)
  }

  // 2) fallback to scraping if necessary
  if (!teamsList || teamsList.length === 0) {
    teamsList = await fetchValveRankingFallback()
    teamsList = teamsList
      .slice(0, 50)
      .map((t, i) => ({ id: null, name: t.name, valve_rank: i + 1, source_url: t.source_url }))
    console.log(`Fallback produced ${teamsList.length} teams`)
  }

  const output = { generated_at: new Date().toISOString(), teams: [] }

  // 3) for each team get roster
  for (const teamRef of teamsList) {
    console.log(`Processing team: ${teamRef.name} (${teamRef.id || "no-id"})`)
    const teamData = await fetchTeamFromGridOrFallback(teamRef)
    // teamData should include players as array with at least nickname or id
    if (!teamData) {
      console.warn(`No team data for ${teamRef.name}, skipping`)
      continue
    }
    const teamObj = {
      team_id: teamRef.id || teamData.id || teamRef.name.replace(/\s+/g, "_").toLowerCase(),
      name: teamRef.name || teamData.name,
      valve_rank: teamRef.valve_rank || null,
      tier: "tier1", // top-50 => tier1 per agreement
      logo_url: teamData.logo || teamData.logo_url || null,
      logo_local: null,
      players: [],
    }

    // download logo if any
    if (teamObj.logo_url) {
      const lp = path.join(OUT, "team_logos", `${teamObj.team_id}.png`)
      const local = await download(teamObj.logo_url, lp)
      if (local) teamObj.logo_local = local
    }

    const roster = teamData.players || teamData.roster || []
    for (const pRef of roster.slice(0, 5)) {
      // normalize pRef to {id?, nickname?, source_url?}
      const norm = {
        id: pRef.id || pRef.player_id || pRef.playerId || null,
        nickname: pRef.nickname || pRef.name || pRef.nick || null,
        source_url: pRef.url || pRef.source_url || pRef.link || null,
      }
      const playerMeta = await fetchPlayerFromGridOrFallback(norm)
      // detect role
      const role = detectRoleFromMeta(playerMeta)
      const tier = "tier1" // from team
      const price = calcPrice(tier, role, playerMeta.rating_3 ? Number.parseFloat(playerMeta.rating_3) : null)
      // download photo
      let photoLocal = null
      if (playerMeta.photo) {
        const pp = path.join(
          OUT,
          "images",
          `${(playerMeta.player_id || playerMeta.nickname || "player").toString().replace(/\W/g, "_")}.png`,
        )
        const dl = await download(playerMeta.photo, pp)
        if (dl) photoLocal = dl
      }
      const playerObj = {
        player_id: playerMeta.player_id || norm.id || norm.nickname,
        nickname: playerMeta.nickname || norm.nickname,
        full_name: playerMeta.full_name || null,
        role,
        tier,
        hltv_rating_3: playerMeta.rating_3 || null,
        kd: playerMeta.kd || null,
        adr: playerMeta.adr || null,
        price,
        status: "active",
        photo_url: playerMeta.photo || null,
        photo_local: photoLocal,
        source: { grid: null, fallback: norm.source_url },
      }
      teamObj.players.push(playerObj)
    }

    output.teams.push(teamObj)
    // small sleep between teams (limiter will regulate)
  }

  // write JSON
  const outPath = path.join(OUT, "data.json")
  await fs.writeJson(outPath, output, { spaces: 2 })
  console.log(`Saved output to ${outPath}`)
}

main().catch((err) => {
  console.error("Fatal error", err)
  process.exit(1)
})

package.json (запусти npm install)

Создай
package.json
и
установи
{
  ;("name")
  : "fantasy-cs2-scraper",
  "version": "1.0.0",
  "main": "scrape_grid_top50.js",
  "scripts":
  ;("start")
  :"node scrape_grid_top50.js"
  ,
  "dependencies":
  ;("axios")
  :\"^1.5.0\",\
    "bottleneck":\"^2.19.5",
    \"cheerio":\"^1.0.0-rc.12",
    "fs-extra":"^11.1.1"\
  \
}

В
терминале: npm
install

Как
это
работает(коротко)
\
Скрипт пытается получить топ-50 через GRID (используя токен).
\
Если GRID возвращает данные — использует их. Если нет — использует fallback (публичная страница Valve/BLAST/HLTV).
\
Для каждой команды получает roster (через GRID team endpoint или парсинг команды page).

Для каждого игрока пытается получить stats (через GRID player endpoint или парсинг HLTV).

Определяет роль эвристически (или по source role), присваивает tier (в нашем правиле — топ-50 = tier1) и считает цену по формуле.

Скачивает фото/лого, сохраняет JSON.

Что тебе нужно сделать сейчас

Скопировать config.js и scrape_grid_top50.js в проект.

В config.js поставить GRID_BASE_URL и GRID_TOKEN (твой токен уже вставлен в примере).

При наличии в GRID документации реальных endpoint путей — заменить gridEndpoints шаблоны на реальные (например "/v2/teams?filter[game]=cs2&filter[ranking]=valve&page[size]=50"). Если не заменишь — скрипт всё равно попытается grid, и при ошибке перейдёт к fallback.

npm install → node scrape_grid_top50.js.

Посмотреть out/data.json.

Советы и дальнейшие шаги

Проверь GRID docs (docs.grid.is / Postman collection) и обнови шаблоны endpoint'ов в config (это даст максимально качественные данные и реальные рейтинги/статы).

Для точной роли лучше сделать админский CSV для ручного подтверждения — многие источники не дают роль прямо.

Затем интегрируй out/data.json в backend игры: импортируй игроков в рынок, привяжи цены и статусы.

Если хочешь — я могу подправить скрипт под точные GRID endpoints (дай ссылку на документацию или выдачу из Postman), или сделать версию на Python.\
