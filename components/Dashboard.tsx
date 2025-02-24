import { CircularProgress } from "@/components/ui/circular-progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Flame } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

interface DashboardProps {
  totals: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sodium: number
    sugar: number
    fiber: number
  }
  goals: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sodium: number
    sugar: number
    fiber: number
  }
  remaining: {
    calories: number
    carbs: number
    fats: number
    protein: number
  }
}

export function Dashboard({ totals, goals, remaining }: DashboardProps) {
  return (
    <>
      <Navigation />
      <div className="container mx-auto p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Today</h1>
          </div>
          {/* TODO: Add day streak counter*/}
          {/* <div className="text-right">
            <span className="text-2xl font-bold">{totals.calories > 0 ? 1 : 0}</span>
            <span className="text-sm text-muted-foreground block">DAY STREAK</span>
          </div> */}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calories</CardTitle>
              <p className="text-sm text-muted-foreground">Remaining = Goal - Food + Exercise</p>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <CircularProgress value={remaining.calories} max={goals.calories} size={128}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{remaining.calories}</div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </CircularProgress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Food
                  </span>
                  <span className="text-sm">{totals.calories}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Exercise
                  </span>
                  <span className="text-sm ml-4">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macros</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between">
              <div className="text-center">
                <div className="relative w-24 h-24 mb-2">
                  <CircularProgress value={totals.carbs} max={goals.carbs} size={96} className="text-emerald-500">
                    <div className="text-center">
                      <div className="text-xl font-bold">{totals.carbs}</div>
                      <div className="text-xs text-muted-foreground">/{goals.carbs} g</div>
                    </div>
                  </CircularProgress>
                </div>
                <span className="text-sm text-emerald-500 font-medium">Carbohydrates</span>
                <div className="text-xs text-muted-foreground">{goals.carbs - totals.carbs} g left</div>
              </div>
              <div className="text-center">
                <div className="relative w-24 h-24 mb-2">
                  <CircularProgress value={totals.fats} max={goals.fats} size={96} className="text-purple-500">
                    <div className="text-center">
                      <div className="text-xl font-bold">{totals.fats}</div>
                      <div className="text-xs text-muted-foreground">/{goals.fats} g</div>
                    </div>
                  </CircularProgress>
                </div>
                <span className="text-sm text-purple-500 font-medium">Fat</span>
                <div className="text-xs text-muted-foreground">{goals.fats - totals.fats} g left</div>
              </div>
              <div className="text-center">
                <div className="relative w-24 h-24 mb-2">
                  <CircularProgress value={totals.protein} max={goals.protein} size={96} className="text-amber-500">
                    <div className="text-center">
                      <div className="text-xl font-bold">{totals.protein}</div>
                      <div className="text-xs text-muted-foreground">/{goals.protein} g</div>
                    </div>
                  </CircularProgress>
                </div>
                <span className="text-sm text-amber-500 font-medium">Protein</span>
                <div className="text-xs text-muted-foreground">{goals.protein - totals.protein} g left</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Heart Healthy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Fat</span>
                <span className="font-medium">
                  {totals.fats}/{goals.fats}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sodium</span>
                <span className="font-medium">
                  {totals.sodium}/{goals.sodium}mg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cholesterol</span>
                <span className="font-medium">
                  {totals.sugar}/{goals.sugar}g
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Carb</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Net Carbs</span>
                <span className="font-medium">
                  {totals.carbs - totals.fiber}/{goals.carbs}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sugar</span>
                <span className="font-medium">
                  {totals.sugar}/{goals.sugar}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fiber</span>
                <span className="font-medium">
                  {totals.fiber}/{goals.fiber}g
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="#" className="text-blue-500 hover:underline block mb-4">
                Change Nutrients
              </Link>
              <div className="flex justify-between items-center">
                <span>Carbohydrates</span>
                <span className="font-medium">
                  {totals.carbs}/{goals.carbs}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fat</span>
                <span className="font-medium">
                  {totals.fats}/{goals.fats}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Protein</span>
                <span className="font-medium">
                  {totals.protein}/{goals.protein}g
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Dashboard