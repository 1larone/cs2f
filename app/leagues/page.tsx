import { LeagueDashboard } from "@/components/league-dashboard"
import { AppHeader } from "@/components/app-header"

export default function LeaguesPage() {
  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <LeagueDashboard />
      </main>
    </div>
  )
}
