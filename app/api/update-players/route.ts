import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// API route для обновления данных игроков через GRID API
export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие GRID API ключа
    if (!process.env.GRID_API_KEY) {
      return NextResponse.json({ error: "GRID_API_KEY не найден в переменных окружения" }, { status: 500 })
    }

    // Запускаем скрипт сбора данных
    const { main } = require("../../../scripts/fetch-top50-teams")
    await main()

    // Читаем обновленные данные
    const dataPath = path.join(process.cwd(), "data", "top50-players.json")
    const playersData = await fs.readFile(dataPath, "utf-8")
    const players = JSON.parse(playersData)

    return NextResponse.json({
      success: true,
      message: `Обновлено ${players.length} игроков из топ-50 команд`,
      playersCount: players.length,
    })
  } catch (error) {
    console.error("Ошибка обновления данных игроков:", error)
    return NextResponse.json({ error: "Ошибка при обновлении данных игроков" }, { status: 500 })
  }
}

// GET route для получения статуса последнего обновления
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "top50-players.json")

    try {
      const stats = await fs.stat(dataPath)
      const playersData = await fs.readFile(dataPath, "utf-8")
      const players = JSON.parse(playersData)

      return NextResponse.json({
        lastUpdated: stats.mtime,
        playersCount: players.length,
        hasData: true,
      })
    } catch {
      return NextResponse.json({
        lastUpdated: null,
        playersCount: 0,
        hasData: false,
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения статуса" }, { status: 500 })
  }
}
