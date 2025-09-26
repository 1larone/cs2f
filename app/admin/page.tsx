import { DataUpdater } from "@/components/admin/data-updater"
import { GridTest } from "@/components/admin/grid-test"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Админ панель</h1>
          <p className="text-muted-foreground">Управление данными игроков и командами</p>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          <GridTest />
          <DataUpdater />
        </div>
      </div>
    </div>
  )
}
