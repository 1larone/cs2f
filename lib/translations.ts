export type Language = "en" | "ru" | "ua"

export interface Translations {
  // App metadata
  appTitle: string
  appDescription: string

  // Navigation
  team: string
  leagues: string
  credits: string

  // Team Composition
  teamComposition: string
  teamCompositionSubtitle: string
  remainingBudget: string
  mainTeam: string
  reserveTeam: string
  players: string
  avgRating: string
  tier1Players: string
  totalCost: string
  myTeams: string
  teams: string
  playerMarket: string
  market: string
  saveTeamCompositions: string
  missing: string
  missingPlayer: string

  // Player Market
  playerMarketTitle: string
  playersAvailable: string
  tier1Only: string
  t1: string
  searchPlayers: string
  allRoles: string
  awp: string
  entry: string
  rifler: string
  support: string
  igl: string
  allTiers: string
  tier1: string
  tier2: string
  tier3: string
  allPrices: string
  under5k: string
  between5k7k: string
  over7k: string
  noPlayersFound: string
  adjustFilters: string
  clearFilters: string

  // Player Card
  selected: string
  addToTeam: string
  rating: string
  kd: string
  adr: string

  // Player Profile Modal
  playerProfile: string
  marketValue: string
  alreadyInTeam: string
  hltvStatistics: string
  rating20: string
  kdRatio: string
  mapsPlayed: string
  recentMatches: string
  strengths: string
  teamImpact: string

  // League Dashboard
  fantasyLeagues: string
  leaderboard: string
  currentRank: string
  wldRecord: string
  totalPlayers: string
  progress: string
  ranks: string
  rules: string
  points: string
  wld: string
  tournaments: string
  liveMatches: string
  upcomingMatches: string
  completedMatches: string
  participants: string
  prizePool: string
  duration: string
  activeMatches: string

  // Team Status
  complete: string

  // HLTV Integration
  liveMatches: string
  loading: string
  error: string
  noLiveMatches: string
  live: string
  topPerformers: string
  fantasyScoring: string
  matchStats: string
  realTimeData: string

  // Common
  selectMainPlayer: string
  selectReservePlayer: string
  moveToTeam: string

  // League System
  leagueSystem: string
  leagueA: string
  leagueB: string
  leagueC: string
  promotion: string
  relegation: string
  superCup: string
  matchday: string
  nextMatch: string
  myLeague: string
  leagueTable: string
  matchHistory: string
  vsOpponent: string
  victory: string
  defeat: string
  draw: string
  leaguePoints: string
  fantasyPoints: string
  matchResult: string
  awaitingResult: string
  promotionZone: string
  relegationZone: string
  safeZone: string
  qualifiedForSuperCup: string
  semifinal: string
  final: string
  thirdPlace: string
  champion: string
  runnerUp: string
  bronze: string
  badge: string
  additionalCredits: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // App metadata
    appTitle: "Fantasy CS2",
    appDescription: "Build your ultimate Counter-Strike 2 fantasy team",

    // Navigation
    team: "Team",
    leagues: "Leagues",
    credits: "credits",

    // Team Composition
    teamComposition: "Team Composition",
    teamCompositionSubtitle: "Build your main and reserve CS2 fantasy teams",
    remainingBudget: "Remaining Budget",
    mainTeam: "Main Team",
    reserveTeam: "Reserve Team",
    players: "Players",
    avgRating: "Avg Rating",
    tier1Players: "Tier 1 Players",
    totalCost: "Total Cost",
    myTeams: "My Teams",
    teams: "Teams",
    playerMarket: "Player Market",
    market: "Market",
    saveTeamCompositions: "Save Team Compositions",
    missing: "missing",
    missingPlayer: "Missing {role} player",

    // Player Market
    playerMarketTitle: "Player Market",
    playersAvailable: "{count} players available",
    tier1Only: "Tier 1 Only",
    t1: "T1",
    searchPlayers: "Search players...",
    allRoles: "All Roles",
    awp: "AWP",
    entry: "Entry",
    rifler: "Rifler",
    support: "Support",
    igl: "IGL",
    allTiers: "All Tiers",
    tier1: "Tier 1",
    tier2: "Tier 2",
    tier3: "Tier 3",
    allPrices: "All Prices",
    under5k: "Under $5,000",
    between5k7k: "$5,000 - $7,500",
    over7k: "Over $7,500",
    noPlayersFound: "No players found",
    adjustFilters: "Try adjusting your filters to see more players",
    clearFilters: "Clear Filters",

    // Player Card
    selected: "Selected",
    addToTeam: "Add to Team",
    rating: "Rating",
    kd: "K/D",
    adr: "ADR",

    // Player Profile Modal
    playerProfile: "Player Profile",
    marketValue: "Market Value",
    alreadyInTeam: "Already in Team",
    hltvStatistics: "HLTV Statistics",
    rating20: "Rating 2.0",
    kdRatio: "K/D Ratio",
    mapsPlayed: "Maps Played",
    recentMatches: "Recent Matches",
    strengths: "Strengths",
    teamImpact: "Team Impact",

    // League Dashboard
    fantasyLeagues: "Fantasy Leagues",
    leaderboard: "Leaderboard",
    currentRank: "Current Rank",
    wldRecord: "W-L-D Record",
    totalPlayers: "Total Players",
    progress: "Progress",
    ranks: "Ranks",
    rules: "Rules",
    points: "Points",
    wld: "W-L-D",
    tournaments: "Tournaments",
    liveMatches: "Live Matches",
    upcomingMatches: "Upcoming Matches",
    completedMatches: "Completed Matches",
    participants: "Participants",
    prizePool: "Prize Pool",
    duration: "Duration",
    activeMatches: "Active Matches",

    // Team Status
    complete: "✓",

    // HLTV Integration
    live: "LIVE",
    topPerformers: "Top Performers",
    fantasyScoring: "Fantasy Scoring",
    matchStats: "Match Statistics",
    realTimeData: "Real-time HLTV Data",

    // Common
    selectMainPlayer: "Select main player",
    selectReservePlayer: "Select reserve player",
    moveToTeam: "Move to {team} team",

    // League System
    leagueSystem: "League System",
    leagueA: "League A",
    leagueB: "League B",
    leagueC: "League C",
    promotion: "Promotion",
    relegation: "Relegation",
    superCup: "Super Cup",
    matchday: "Matchday",
    nextMatch: "Next Match",
    myLeague: "My League",
    leagueTable: "League Table",
    matchHistory: "Match History",
    vsOpponent: "vs {opponent}",
    victory: "Victory",
    defeat: "Defeat",
    draw: "Draw",
    leaguePoints: "League Points",
    fantasyPoints: "Fantasy Points",
    matchResult: "Match Result",
    awaitingResult: "Awaiting Result",
    promotionZone: "Promotion Zone",
    relegationZone: "Relegation Zone",
    safeZone: "Safe Zone",
    qualifiedForSuperCup: "Qualified for Super Cup",
    semifinal: "Semifinal",
    final: "Final",
    thirdPlace: "3rd Place Match",
    champion: "Champion",
    runnerUp: "Runner-up",
    bronze: "Bronze Medal",
    badge: "Badge",
    additionalCredits: "Additional Credits",
  },

  ru: {
    // App metadata
    appTitle: "Fantasy CS2",
    appDescription: "Создайте свою идеальную фэнтези команду Counter-Strike 2",

    // Navigation
    team: "Команда",
    leagues: "Лиги",
    credits: "кредиты",

    // Team Composition
    teamComposition: "Состав команды",
    teamCompositionSubtitle: "Создайте основную и резервную команды CS2",
    remainingBudget: "Остаток бюджета",
    mainTeam: "Основная команда",
    reserveTeam: "Резервная команда",
    players: "Игроки",
    avgRating: "Средний рейтинг",
    tier1Players: "Игроки Tier 1",
    totalCost: "Общая стоимость",
    myTeams: "Мои команды",
    teams: "Команды",
    playerMarket: "Рынок игроков",
    market: "Рынок",
    saveTeamCompositions: "Сохранить составы команд",
    missing: "не хватает",
    missingPlayer: "Нет игрока на позиции {role}",

    // Player Market
    playerMarketTitle: "Рынок игроков",
    playersAvailable: "Доступно игроков: {count}",
    tier1Only: "Только Tier 1",
    t1: "T1",
    searchPlayers: "Поиск игроков...",
    allRoles: "Все роли",
    awp: "AWP",
    entry: "Entry",
    rifler: "Rifler",
    support: "Support",
    igl: "IGL",
    allTiers: "Все уровни",
    tier1: "Tier 1",
    tier2: "Tier 2",
    tier3: "Tier 3",
    allPrices: "Все цены",
    under5k: "До $5,000",
    between5k7k: "$5,000 - $7,500",
    over7k: "Свыше $7,500",
    noPlayersFound: "Игроки не найдены",
    adjustFilters: "Попробуйте изменить фильтры для просмотра большего количества игроков",
    clearFilters: "Очистить фильтры",

    // Player Card
    selected: "Выбран",
    addToTeam: "Добавить в команду",
    rating: "Рейтинг",
    kd: "У/С",
    adr: "УВР",

    // Player Profile Modal
    playerProfile: "Профиль игрока",
    marketValue: "Рыночная стоимость",
    alreadyInTeam: "Уже в команде",
    hltvStatistics: "Статистика HLTV",
    rating20: "Рейтинг 2.0",
    kdRatio: "Соотношение У/С",
    mapsPlayed: "Сыграно карт",
    recentMatches: "Последние матчи",
    strengths: "Сильные стороны",
    teamImpact: "Влияние на команду",

    // League Dashboard
    fantasyLeagues: "Фэнтези лиги",
    leaderboard: "Таблица лидеров",
    currentRank: "Текущий ранг",
    wldRecord: "П-П-Н",
    totalPlayers: "Всего игроков",
    progress: "Прогресс",
    ranks: "Ранги",
    rules: "Правила",
    points: "Очки",
    wld: "П-П-Н",
    tournaments: "Турниры",
    liveMatches: "Прямые трансляции",
    upcomingMatches: "Предстоящие матчи",
    completedMatches: "Завершенные матчи",
    participants: "Участников",
    prizePool: "Призовой фонд",
    duration: "Длительность",
    activeMatches: "Активных матчей",

    // Team Status
    complete: "✓",

    // HLTV Integration
    liveMatches: "Прямые трансляции",
    loading: "Загрузка",
    error: "Ошибка",
    noLiveMatches: "Нет прямых трансляций",
    live: "ПРЯМОЙ ЭФИР",
    topPerformers: "Лучшие игроки",
    fantasyScoring: "Фэнтези очки",
    matchStats: "Статистика матча",
    realTimeData: "Данные HLTV в реальном времени",

    // Common
    selectMainPlayer: "Выберите основного игрока",
    selectReservePlayer: "Выберите резервного игрока",
    moveToTeam: "Переместить в {team} команду",

    // League System
    leagueSystem: "Система лиг",
    leagueA: "Лига А",
    leagueB: "Лига Б",
    leagueC: "Лига С",
    promotion: "Повышение",
    relegation: "Понижение",
    superCup: "Суперкубок",
    matchday: "Тур",
    nextMatch: "Следующий матч",
    myLeague: "Моя лига",
    leagueTable: "Турнирная таблица",
    matchHistory: "История матчей",
    vsOpponent: "против {opponent}",
    victory: "Победа",
    defeat: "Поражение",
    draw: "Ничья",
    leaguePoints: "Очки лиги",
    fantasyPoints: "Фэнтези очки",
    matchResult: "Результат матча",
    awaitingResult: "Ожидание результата",
    promotionZone: "Зона повышения",
    relegationZone: "Зона понижения",
    safeZone: "Безопасная зона",
    qualifiedForSuperCup: "Прошел в Суперкубок",
    semifinal: "Полуфинал",
    final: "Финал",
    thirdPlace: "Матч за 3-е место",
    champion: "Чемпион",
    runnerUp: "Вице-чемпион",
    bronze: "Бронзовая медаль",
    badge: "Значок",
    additionalCredits: "Дополнительные кредиты",
  },

  ua: {
    // App metadata
    appTitle: "Fantasy CS2",
    appDescription: "Створіть свою ідеальну фентезі команду Counter-Strike 2",

    // Navigation
    team: "Команда",
    leagues: "Ліги",
    credits: "кредити",

    // Team Composition
    teamComposition: "Склад команди",
    teamCompositionSubtitle: "Створіть основну та резервну команди CS2",
    remainingBudget: "Залишок бюджету",
    mainTeam: "Основна команда",
    reserveTeam: "Резервна команда",
    players: "Гравці",
    avgRating: "Середній рейтинг",
    tier1Players: "Гравці Tier 1",
    totalCost: "Загальна вартість",
    myTeams: "Мої команди",
    teams: "Команди",
    playerMarket: "Ринок гравців",
    market: "Ринок",
    saveTeamCompositions: "Зберегти склади команд",
    missing: "бракує",
    missingPlayer: "Немає гравця на позиції {role}",

    // Player Market
    playerMarketTitle: "Ринок гравців",
    playersAvailable: "Доступно гравців: {count}",
    tier1Only: "Тільки Tier 1",
    t1: "T1",
    searchPlayers: "Пошук гравців...",
    allRoles: "Всі ролі",
    awp: "AWP",
    entry: "Entry",
    rifler: "Rifler",
    support: "Support",
    igl: "IGL",
    allTiers: "Всі рівні",
    tier1: "Tier 1",
    tier2: "Tier 2",
    tier3: "Tier 3",
    allPrices: "Всі ціни",
    under5k: "До $5,000",
    between5k7k: "$5,000 - $7,500",
    over7k: "Понад $7,500",
    noPlayersFound: "Гравців не знайдено",
    adjustFilters: "Спробуйте змінити фільтри для перегляду більшої кількості гравців",
    clearFilters: "Очистити фільтри",

    // Player Card
    selected: "Обрано",
    addToTeam: "Додати до команди",
    rating: "Рейтинг",
    kd: "В/С",
    adr: "СШР",

    // Player Profile Modal
    playerProfile: "Профіль гравця",
    marketValue: "Ринкова вартість",
    alreadyInTeam: "Вже в команді",
    hltvStatistics: "Статистика HLTV",
    rating20: "Рейтинг 2.0",
    kdRatio: "Співвідношення В/С",
    mapsPlayed: "Зіграно карт",
    recentMatches: "Останні матчі",
    strengths: "Сильні сторони",
    teamImpact: "Вплив на команду",

    // League Dashboard
    fantasyLeagues: "Фентезі ліги",
    leaderboard: "Таблиця лідерів",
    currentRank: "Поточний ранг",
    wldRecord: "П-П-Н",
    totalPlayers: "Всього гравців",
    progress: "Прогрес",
    ranks: "Ранги",
    rules: "Правила",
    points: "Очки",
    wld: "П-П-Н",
    tournaments: "Турніри",
    liveMatches: "Прямі трансляції",
    upcomingMatches: "Майбутні матчі",
    completedMatches: "Завершені матчі",
    participants: "Учасників",
    prizePool: "Призовий фонд",
    duration: "Тривалість",
    activeMatches: "Активних матчів",

    // Team Status
    complete: "✓",

    // HLTV Integration
    liveMatches: "Прямі трансляції",
    loading: "Завантаження",
    error: "Помилка",
    noLiveMatches: "Немає прямих трансляцій",
    live: "ПРЯМИЙ ЕФІР",
    topPerformers: "Кращі гравці",
    fantasyScoring: "Фентезі очки",
    matchStats: "Статистика матчу",
    realTimeData: "Дані HLTV в реальному часі",

    // Common
    selectMainPlayer: "Оберіть основного гравця",
    selectReservePlayer: "Оберіть резервного гравця",
    moveToTeam: "Перемістити до {team} команди",

    // League System
    leagueSystem: "Система ліг",
    leagueA: "Ліга А",
    leagueB: "Ліга Б",
    leagueC: "Ліга С",
    promotion: "Підвищення",
    relegation: "Пониження",
    superCup: "Суперкубок",
    matchday: "Тур",
    nextMatch: "Наступний матч",
    myLeague: "Моя ліга",
    leagueTable: "Турнірна таблиця",
    matchHistory: "Історія матчів",
    vsOpponent: "проти {opponent}",
    victory: "Перемога",
    defeat: "Поразка",
    draw: "Нічия",
    leaguePoints: "Очки ліги",
    fantasyPoints: "Фентезі очки",
    matchResult: "Результат матчу",
    awaitingResult: "Очікування результату",
    promotionZone: "Зона підвищення",
    relegationZone: "Зона понижения",
    safeZone: "Безпечна зона",
    qualifiedForSuperCup: "Пройшов до Суперкубка",
    semifinal: "Півфінал",
    final: "Фінал",
    thirdPlace: "Матч за 3-є місце",
    champion: "Чемпіон",
    runnerUp: "Віце-чемпіон",
    bronze: "Бронзова медаль",
    badge: "Значок",
    additionalCredits: "Додаткові кредити",
  },
}

export function formatTranslation(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

export function t(language: Language, key: keyof Translations, params?: Record<string, string | number>): string {
  const translation = translations[language][key]
  if (params) {
    return formatTranslation(translation, params)
  }
  return translation
}
