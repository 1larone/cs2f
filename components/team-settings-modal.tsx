"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadIcon, EditIcon } from "./icons"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"
import type { LeagueUser } from "@/types/player"

interface TeamSettingsModalProps {
  user: LeagueUser
  isOpen: boolean
  onClose: () => void
  onSave: (teamName: string, teamLogo?: string) => void
}

export function TeamSettingsModal({ user, isOpen, onClose, onSave }: TeamSettingsModalProps) {
  const { t, language } = useLanguage()
  const [teamName, setTeamName] = useState(user.teamName)
  const [teamLogo, setTeamLogo] = useState(user.teamLogo || "")
  const [logoPreview, setLogoPreview] = useState(user.teamLogo || "")

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        setTeamLogo(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave(teamName, teamLogo)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EditIcon className="w-5 h-5" />
            {language === "en" ? "Team Settings" : language === "ru" ? "Настройки команды" : "Налаштування команди"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language === "en" ? "Team Logo" : language === "ru" ? "Логотип команды" : "Логотип команди"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={logoPreview || "/placeholder.svg?height=64&width=64"} />
                  <AvatarFallback className="text-lg">{teamName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 p-2 border border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <UploadIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {language === "en"
                          ? "Upload PNG logo"
                          : language === "ru"
                            ? "Загрузить PNG логотип"
                            : "Завантажити PNG логотип"}
                      </span>
                    </div>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "en"
                      ? "Recommended: 64x64px PNG"
                      : language === "ru"
                        ? "Рекомендуется: 64x64px PNG"
                        : "Рекомендується: 64x64px PNG"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="team-name">
              {language === "en" ? "Team Name" : language === "ru" ? "Название команды" : "Назва команди"}
            </Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={
                language === "en"
                  ? "Enter team name..."
                  : language === "ru"
                    ? "Введите название команды..."
                    : "Введіть назву команди..."
              }
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {teamName.length}/20 {language === "en" ? "characters" : language === "ru" ? "символов" : "символів"}
            </p>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {language === "en" ? "Preview" : language === "ru" ? "Предварительный просмотр" : "Попередній перегляд"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={logoPreview || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>{teamName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{teamName || user.teamName}</div>
                  <div className="text-xs text-muted-foreground">{user.username}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              {language === "en" ? "Cancel" : language === "ru" ? "Отмена" : "Скасувати"}
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-neon-blue hover:bg-cyan-500 text-black">
              {language === "en" ? "Save Changes" : language === "ru" ? "Сохранить изменения" : "Зберегти зміни"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
