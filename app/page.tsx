import { TeamComposition } from "@/components/team-composition"
import { AppHeader } from "@/components/app-header"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <TeamComposition />
        </div>
      </main>
    </div>
  )
}
