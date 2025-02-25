import { Navigation } from "@/components/navigation"
import { LabelScanner } from "@/components/label-scanner"

export default function ScanLabelPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Scan Nutrition Label</h1>
        <LabelScanner />
      </main>
    </div>
  )
} 