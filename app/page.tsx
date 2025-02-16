import { Navigation } from "@/app/components/navigation"
import { FoodDiary } from "@/app/components/food-diary"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <FoodDiary meal="breakfast" />
    </div>
  )
}

