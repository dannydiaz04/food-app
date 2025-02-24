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
      <main className="px-2 sm:px-4 py-4 sm:py-6 mx-auto w-full">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <AddFoodClient meal={meal} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}