import { Navigation } from "@/components/navigation"
import { AddFoodClient } from "./add-food-client"
import { Suspense } from "react"

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    meal: string
  }
}

export default async function AddFoodPage({ params }: PageProps) {
  const meal = params.meal

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <AddFoodClient meal={meal} />
        </Suspense>
      </main>
    </div>
  )
}