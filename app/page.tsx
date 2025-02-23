import { Dashboard } from "@/components/Dashboard"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { TestOpenAI } from "@/components/TestOpenAI"

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Make the component async to fetch data
export default async function HomePage() {
  // Get the authenticated user's session
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div>Please sign in to view your dashboard</div>
  }

  // Get the user's ID from Supabase
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
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
    .from("food")
    .select(`
      calories,
      carbs,
      fats,
      protein,
      sodium,
      sugar,
      fiber
    `)
    .eq("userId", userData.id)
    .gte("date", today.toISOString())
    .lt("date", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

  if (foodError) {
    console.error("Error fetching food entries:", foodError)
    return <div>Error loading food data</div>
  }

  // Calculate totals
  const totals = (foodEntries || []).reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fats: acc.fats + (entry.fats || 0),
      protein: acc.protein + (entry.protein || 0),
      sodium: acc.sodium + (entry.sodium || 0),
      sugar: acc.sugar + (entry.sugar || 0),
      fiber: acc.fiber + (entry.fiber || 0),
    }),
    {
      calories: 0,
      carbs: 0,
      fats: 0,
      protein: 0,
      sodium: 0,
      sugar: 0,
      fiber: 0,
    },
  )

  // Goals (you might want to make these configurable per user later)
  const goals = {
    calories: 2033,
    carbs: 202,
    fats: 45,
    protein: 205,
    sodium: 2300,
    sugar: 76,
    fiber: 38,
  }

  // Calculate remaining values
  const remaining = {
    calories: goals.calories - totals.calories,
    carbs: goals.carbs - totals.carbs,
    fats: goals.fats - totals.fats,
    protein: goals.protein - totals.protein,
  }

  return (
    <div>
      <Dashboard totals={totals} goals={goals} remaining={remaining} />
      <TestOpenAI />
    </div>
  )
}

