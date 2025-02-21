import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { food_ky: string } }
) {
  try {
    const resolvedParams = await params;
    console.log('Server-side DELETE params:', resolvedParams);
    console.log('Server-side food_ky value:', resolvedParams.food_ky);

    const food_ky = resolvedParams.food_ky;

    if (!food_ky) {
      return NextResponse.json({ error: 'Missing food_ky' }, { status: 400 });
    }

    // Get the authenticated user's session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's ID from Supabase using their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the food entry
    const { error } = await supabase
      .from('food')
      .delete()
      .eq('food_ky', food_ky)
      .eq('userId', userData.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { food_ky: string } }
) {
  try {
    const resolvedParams = await params;
    const food_ky = resolvedParams.food_ky;

    if (!food_ky) {
      return NextResponse.json({ error: 'Missing food_ky' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's ID from Supabase using their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log('Updating food entry:', { food_ky, body });

    // Update the food entry with correct field names
    const { error } = await supabase
      .from('food')
      .update({
        foodName: body.foodName,
        meal: body.meal,
        calories: Math.round(Number(body.calories) || 0),
        carbs: Math.round(Number(body.carbs) || 0),
        fats: Math.round(Number(body.fats) || 0),
        protein: Math.round(Number(body.protein) || 0),
        date: new Date(body.date).toISOString(),
        // Micronutrients with correct field names
        fiber: Math.round(Number(body.fiber) || 0),
        sodium: Math.round(Number(body.sodium) || 0),
        sugar: Math.round(Number(body.sugar) || 0),
        zinc: Math.round(Number(body.zinc) || 0),
        vitamin_a: Math.round(Number(body.vitamin_a) || 0),
        vitamin_b: Math.round(Number(body.vitamin_b) || 0),
        vitamin_b1: Math.round(Number(body.vitamin_b1) || 0),
        vitamin_b2: Math.round(Number(body.vitamin_b2) || 0),
        vitamin_b3: Math.round(Number(body.vitamin_b3) || 0),
        vitamin_b5: Math.round(Number(body.vitamin_b5) || 0),
        vitamin_b6: Math.round(Number(body.vitamin_b6) || 0),
        vitamin_b7: Math.round(Number(body.vitamin_b7) || 0),
        vitamin_b9: Math.round(Number(body.vitamin_b9) || 0),
        vitamin_b12: Math.round(Number(body.vitamin_b12) || 0),
        vitamin_c: Math.round(Number(body.vitamin_c) || 0),
        vitamin_d: Math.round(Number(body.vitamin_d) || 0),
        vitamin_e: Math.round(Number(body.vitamin_e) || 0),
        vitamin_k: Math.round(Number(body.vitamin_k) || 0),
        calcium: Math.round(Number(body.calcium) || 0),
        iron: Math.round(Number(body.iron) || 0),
        phosphorus: Math.round(Number(body.phosphorus) || 0),
        magnesium: Math.round(Number(body.magnesium) || 0),
        potassium: Math.round(Number(body.potassium) || 0),
        chloride: Math.round(Number(body.chloride) || 0),
        sulfur: Math.round(Number(body.sulfur) || 0),
        manganese: Math.round(Number(body.manganese) || 0),
        copper: Math.round(Number(body.copper) || 0),
        iodine: Math.round(Number(body.iodine) || 0),
        cobalt: Math.round(Number(body.cobalt) || 0),
        fluoride: Math.round(Number(body.fluoride) || 0),
        selenium: Math.round(Number(body.selenium) || 0),
        molybdenum: Math.round(Number(body.molybdenum) || 0),
        chromium: Math.round(Number(body.chromium) || 0)
      })
      .eq('food_ky', food_ky)
      .eq('userId', userData.id);

    if (error) {
      console.error('Error updating food entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Food entry updated successfully" });
  } catch (error) {
    console.error('Error updating food entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 