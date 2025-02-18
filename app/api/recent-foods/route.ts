import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get the session using the correct import
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to view recent foods" },
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

    // Get recent foods for the user, ordered by most recent first
    const { data: recentFoods, error } = await supabase
      .from("food")
      .select(`
        food_ky,
        foodName,
        quantity,
        unit,
        calories,
        carbs,
        fats,
        protein
      `)
      .eq("userId", userData.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching foods:", error)
      throw error
    }

    // Log the data to see what we're getting
    console.log("Recent foods data:", recentFoods)

    if (!recentFoods) {
      return NextResponse.json([])
    }

    return NextResponse.json(recentFoods)
  } catch (error) {
    console.error("Error fetching recent foods:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent foods" },
      { status: 500 }
    )
  }
} 