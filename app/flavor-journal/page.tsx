import { Navigation } from "@/components/navigation"
import { FlavorJournal } from "@/components/flavor-journal"

export default function FlavorJournalPage() {
  return (
    <div>
      <Navigation />
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <FlavorJournal />
      </main>
    </div>
  )
} 