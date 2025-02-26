import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the user's ID from Supabase using their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      console.error("Error finding user:", userError)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate start date (Monday of current week)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust to make Monday the first day
    const monday = new Date(today)
    monday.setDate(today.getDate() - diff)
    monday.setHours(0, 0, 0, 0)

    // Calculate end date (Sunday of current week)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // Query Supabase for the user's food entries for the current week
    const { data: foodEntries, error } = await supabase
      .from('food')
      .select(`
        date,
        calories,
        carbs,
        fats,
        protein,
        sodium,
        sugar,
        fiber
      `)
      .eq('userId', userData.id)
      .gte('date', monday.toISOString())
      .lte('date', sunday.toISOString())

    if (error) {
      throw error
    }

    // Aggregate entries by day
    const dailyTotals = foodEntries.reduce((acc, entry) => {
      const dateStr = new Date(entry.date).toISOString().split('T')[0]
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          calories: 0,
          carbs: 0,
          fats: 0,
          protein: 0,
          sodium: 0,
          sugar: 0,
          fiber: 0
        }
      }
      
      acc[dateStr].calories += entry.calories || 0
      acc[dateStr].carbs += entry.carbs || 0
      acc[dateStr].fats += entry.fats || 0
      acc[dateStr].protein += entry.protein || 0
      acc[dateStr].sodium += entry.sodium || 0
      acc[dateStr].sugar += entry.sugar || 0
      acc[dateStr].fiber += entry.fiber || 0
      
      return acc
    }, {})

    // Convert to array
    const weeklyData = Object.values(dailyTotals)

    return NextResponse.json(weeklyData)
  } catch (error) {
    console.error("Error fetching weekly food entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch weekly food entries" },
      { status: 500 }
    )
  }
} 