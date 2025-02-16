import { FoodDiary } from "@/app/components/food-diary"
import { Navigation } from "@/app/components/navigation"

export default function AddFood({ params }: { params: { meal: string } }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <FoodDiary meal={params.meal} />
    </div>
  )
}

