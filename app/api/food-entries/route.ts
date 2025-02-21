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

    // Query Supabase for the user's food entries
    const { data: foodEntries, error } = await supabase
      .from('food')
      .select(`
        food_ky,
        userId,
        foodName,
        meal,
        calories,
        carbs,
        fats,
        protein,
        sodium,
        sugar,
        date
      `)
      .eq('userId', userData.id)
      .order('date', { ascending: false })

    if (error) {
      throw error
    }

    // Transform dates to ISO strings for JSON serialization
    const serializedEntries = foodEntries.map(entry => ({
      ...entry,
      date: new Date(entry.date).toISOString(),
    }))

    return NextResponse.json(serializedEntries)
  } catch (error) {
    console.error("Error fetching food entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch food entries" },
      { status: 500 }
    )
  }
}

// POST endpoint for creating new entries
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the user's ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Insert new food entry into Supabase
    const { error } = await supabase
      .from('food')
      .insert({
        userId: userData.id,
        foodName: body.foodName,
        meal: body.meal,
        calories: body.calories,
        carbs: body.carbs,
        fat: body.fat,
        protein: body.protein,
        sodium: body.sodium,
        sugar: body.sugar,
        date: new Date(body.date),
      })

    if (error) {
      throw error
    }

    return NextResponse.json({ message: "Food entry created successfully" })
  } catch (error) {
    console.error("Error creating food entry:", error)
    return NextResponse.json(
      { error: "Failed to create food entry" },
      { status: 500 }
    )
  }
}

// DELETE endpoint for removing entries
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      )
    }

    // Get the user's ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify the entry belongs to the user before deleting
    const { data: entry } = await supabase
      .from('food')
      .select()
      .eq('food_ky', entryId)
      .eq('userId', userData.id)
      .single()

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete the entry
    const { error } = await supabase
      .from('food')
      .delete()
      .eq('food_ky', entryId)
      .eq('userId', userData.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting food entry:", error)
    return NextResponse.json(
      { error: "Failed to delete food entry" },
      { status: 500 }
    )
  }
} 