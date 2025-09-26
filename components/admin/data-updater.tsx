"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, RefreshCw } from "lucide-react"

interface UpdateStatus {
  lastUpdated: string | null
  playersCount: number
  hasData: boolean
}

export function DataUpdater() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [message, setMessage] = useState<string>("")

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/update-players")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Ошибка получения статуса:", error)
    }
  }

  const updatePlayers = async () => {
    setIsUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/update-players", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Успешно! ${data.message}`)
        await fetchStatus()
      } else {
        setMessage(`Ошибка: ${data.error}`)
      }
    } catch (error) {
      setMessage("Ошибка при обновлении данных")
      console.error("Ошибка обновления:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Обновление данных игроков
        </CardTitle>
        <CardDescription>Получение актуальных данных о топ-50 командах через GRID API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Статус данных</p>
              <p className="text-sm text-muted-foreground">
                {status.hasData ? `${status.playersCount} игроков загружено` : "Данные не загружены"}
              </p>
              {status.lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Обновлено: {new Date(status.lastUpdated).toLocaleString("ru-RU")}
                </p>
              )}
            </div>
            <Badge variant={status.hasData ? "default" : "secondary"}>
              {status.hasData ? "Данные есть" : "Нет данных"}
            </Badge>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={updatePlayers} disabled={isUpdating} className="flex-1">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обновление...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Обновить данные
              </>
            )}
          </Button>

          <Button variant="outline" onClick={fetchStatus}>
            Проверить статус
          </Button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes("Успешно")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Для работы требуется GRID_API_KEY в переменных окружения</p>
          <p>• Обновление может занять несколько минут</p>
          <p>• Данные сохраняются в файл и обновляют mock-data.ts</p>
        </div>
      </CardContent>
    </Card>
  )
}
