import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"

export const metadata: Metadata = {
  title: "Fantasy CS2",
  description: "Build your ultimate Counter-Strike 2 fantasy team",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-background text-foreground">
        <div suppressHydrationWarning>
          <LanguageProvider>{children}</LanguageProvider>
        </div>
      </body>
    </html>
  )
}
