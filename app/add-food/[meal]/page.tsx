import { Navigation } from "@/components/navigation"
import { AddFood } from "@/components/add-food"

interface PageProps {
  params: {
    meal: string
  }
}

export default async function AddFoodPage({ params }: PageProps) {
  const meal = await Promise.resolve(params.meal)
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <AddFood meal={meal} />
      </main>
    </div>
  )
}