import { Navigation } from "@/components/navigation"
import { DatabaseSearch } from "@/components/database-search"

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-6 px-4">
        <DatabaseSearch />
      </main>
    </div>
  )
} 