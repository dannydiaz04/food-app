import { Navigation } from "@/components/navigation"
import { AddFood } from "@/components/add-food"

export default function AddFoodPage({
  params
}: {
  params: { meal: string }
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <AddFood meal={params.meal} />
      </main>
    </div>
  )
}