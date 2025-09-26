"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Language } from "@/lib/translations"

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "ua", label: "UA" },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className={`h-7 px-2 text-xs font-medium transition-all ${
            language === lang.code
              ? "bg-neon-blue text-black"
              : "text-muted-foreground hover:text-foreground hover:bg-cyan-500/20"
          }`}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  )
}
