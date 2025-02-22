import { CircularProgress } from "@/components/ui/circular-progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Flame } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Make the component async to fetch data
export default async function DashboardPage() {
  // Get the authenticated user's session
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return <div>Please sign in to view your dashboard</div>
  }

  // Get the user's ID from Supabase
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (userError || !userData) {
    console.error("Error finding user:", userError)
    return <div>Error loading user data</div>
  }

  // Get today's date at midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fetch today's food entries from Supabase
  const { data: foodEntries, error: foodError } = await supabase
    .from('food')
    .select(`
      calories,
      carbs,
      fats,
      protein,
      sodium,
      sugar,
      fiber
    `)
    .eq('userId', userData.id)
    .gte('date', today.toISOString())
    .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

  if (foodError) {
    console.error("Error fetching food entries:", foodError)
    return <div>Error loading food data</div>
  }

  // Calculate totals
  const totals = (foodEntries || []).reduce((acc, entry) => ({
    calories: acc.calories + (entry.calories || 0),
    carbs: acc.carbs + (entry.carbs || 0),
    fats: acc.fats + (entry.fats || 0),
    protein: acc.protein + (entry.protein || 0),
    sodium: acc.sodium + (entry.sodium || 0),
    sugar: acc.sugar + (entry.sugar || 0),
    fiber: acc.fiber + (entry.fiber || 0)
  }), {
    calories: 0,
    carbs: 0,
    fats: 0,
    protein: 0,
    sodium: 0,
    sugar: 0,
    fiber: 0
  })

  // Goals (you might want to make these configurable per user later)
  const goals = {
    calories: 2033,
    carbs: 202,
    fats: 45,
    protein: 205,
    sodium: 2300,
    sugar: 76,
    fiber: 38
  }

  // Calculate remaining values
  const remaining = {
    calories: goals.calories - totals.calories,
    carbs: goals.carbs - totals.carbs,
    fats: goals.fats - totals.fats,
    protein: goals.protein - totals.protein
  }

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
                <CircularProgress value={remaining.calories} max={goals.calories} size={128}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{remaining.calories}</div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </CircularProgress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base Goal</span>
                  <span className="font-medium">{goals.calories}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Food
                  </span>
                  <span className="font-medium">{totals.calories}</span>
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
                <span className="font-medium">{totals.fats}/{goals.fats}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sodium</span>
                <span className="font-medium">{totals.sodium}/{goals.sodium}mg</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cholesterol</span>
                <span className="font-medium">{totals.sugar}/{goals.sugar}g</span>
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
                <span className="font-medium">{totals.carbs - totals.fiber}/{goals.carbs}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sugar</span>
                <span className="font-medium">{totals.sugar}/{goals.sugar}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fiber</span>
                <span className="font-medium">{totals.fiber}/{goals.fiber}g</span>
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
                <span className="font-medium">{totals.carbs}/{goals.carbs}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fat</span>
                <span className="font-medium">{totals.fats}/{goals.fats}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Protein</span>
                <span className="font-medium">{totals.protein}/{goals.protein}g</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

