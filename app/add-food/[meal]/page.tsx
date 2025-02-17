import { FoodDiary } from "@/components/food-diary"
import { Navigation } from "@/components/navigation"
import { redirect } from "next/navigation"

export default function AddFood({ params }: { params: { meal: string } }) {
  // Define the valid meal options
  const validMeals = ["breakfast", "lunch", "dinner", "snacks"]

  // Check if the provided meal is valid, if not redirect
  if (!validMeals.includes(params.meal.toLowerCase())) {
    redirect("/food-diary")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <FoodDiary meal={params.meal.toLowerCase()} />
    </div>
  )
}