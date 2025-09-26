"use client"

import { TrophyIcon, CoinsIcon, UsersIcon, HomeIcon } from "./icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { useLanguage } from "@/contexts/language-context"

export function AppHeader() {
  const { t } = useLanguage()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-blue to-accent rounded-lg flex items-center justify-center">
              <TrophyIcon className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-balance">
              Fantasy <span className="text-neon-blue">CS2</span>
            </h1>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9">
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.team}</span>
              </Button>
            </Link>
            <Link href="/leagues">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9">
                <UsersIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.leagues}</span>
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <div className="flex items-center gap-1 sm:gap-2 bg-secondary/50 rounded-lg px-2 sm:px-4 py-1 sm:py-2">
            <CoinsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <span className="font-semibold text-sm sm:text-base">15K</span>
            <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">{t.credits}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
