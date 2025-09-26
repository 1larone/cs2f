"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Language, Translations } from "@/lib/translations"
import { translations, formatTranslation } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: Translations
  formatT: (key: keyof Translations, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      const savedLanguage = localStorage.getItem("fantasy-cs2-language") as Language
      if (savedLanguage && ["en", "ru", "ua"].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
    }
  }, [isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("fantasy-cs2-language", language)
    }
  }, [language, isClient])

  const t = translations[language]

  const formatT = (key: keyof Translations, params?: Record<string, string | number>) => {
    const template = t[key]
    if (!params) return template
    return formatTranslation(template, params)
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, formatT }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
