import { Navigation } from "@/components/navigation"
import { FoodDiary } from "@/components/food-diary"

export default function FoodDiaryPage() {
  return (
    <div>
      <Navigation />
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <FoodDiary />
      </main>
    </div>
  )
}