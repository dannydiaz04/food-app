import { CircularProgress } from "@/components/ui/circular-progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Flame } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function DashboardPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Today</h1>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">1</span>
            <span className="text-sm text-muted-foreground block">DAY STREAK</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calories</CardTitle>
              <p className="text-sm text-muted-foreground">Remaining = Goal - Food + Exercise</p>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <CircularProgress value={100} max={2033} size={128}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">2033</div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </CircularProgress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base Goal</span>
                  <span className="font-medium">2033</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Food
                  </span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Exercise
                  </span>
                  <span className="font-medium">0</span>
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
                  <CircularProgress value={0} max={202} size={96} className="text-emerald-500">
                    <div className="text-center">
                      <div className="text-xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground">/202 g</div>
                    </div>
                  </CircularProgress>
                </div>
                <span className="text-sm text-emerald-500 font-medium">Carbohydrates</span>
                <div className="text-xs text-muted-foreground">202 g left</div>
              </div>
              <div className="text-center">
                <div className="relative w-24 h-24 mb-2">
                  <CircularProgress value={0} max={45} size={96} className="text-purple-500">
                    <div className="text-center">
                      <div className="text-xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground">/45 g</div>
                    </div>
                  </CircularProgress>
                </div>
                <span className="text-sm text-purple-500 font-medium">Fat</span>
                <div className="text-xs text-muted-foreground">45 g left</div>
              </div>
              <div className="text-center">
                <div className="relative w-24 h-24 mb-2">
                  <CircularProgress value={0} max={205} size={96} className="text-amber-500">
                    <div className="text-center">
                      <div className="text-xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground">/205 g</div>
                    </div>
                  </CircularProgress>
                </div>
                <span className="text-sm text-amber-500 font-medium">Protein</span>
                <div className="text-xs text-muted-foreground">205 g left</div>
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
                <span className="font-medium">0/45g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sodium</span>
                <span className="font-medium">0/2300mg</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cholesterol</span>
                <span className="font-medium">0/300mg</span>
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
                <span className="font-medium">0/202g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sugar</span>
                <span className="font-medium">0/76g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fiber</span>
                <span className="font-medium">0/38g</span>
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
                <span className="font-medium">0/202g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fat</span>
                <span className="font-medium">0/45g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Protein</span>
                <span className="font-medium">0/205g</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

