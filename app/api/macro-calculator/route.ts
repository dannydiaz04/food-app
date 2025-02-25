import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize a Supabase client using the service role key on the server.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to add food entries" },
        { status: 401 }
      );
    }

    // Get the user's ID from Supabase using their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Auto-calculate calories if not provided.
    // Each gram of carbohydrate and protein gives 4 calories, and each gram of fat gives 9 calories.
    let autoCalculatedCalories = 0;
    if (!body.calories) {
      autoCalculatedCalories =
        ((body.carbs ? Number(body.carbs) : 0) * 4) +
        ((body.protein ? Number(body.protein) : 0) * 4) +
        ((body.fats ? Number(body.fats) : 0) * 9);
    }

    const newRow = {
      userId: userData.id,
      date: body.date || new Date().toISOString(),
      meal: body.meal,
      foodName: body.foodName || "Custom Entry",
      quantity: body.quantity ? Number(body.quantity) : 1,
      unit: body.unit || "serving",
      calories: Math.round(body.calories || autoCalculatedCalories),
      carbs: Math.round(body.carbs),
      fats: Math.round(body.fats),
      protein: Math.round(body.protein),
      // Assumes that the keys in body.micronutrients match your DB column names.
      ...body.micronutrients,
    };

    const { error } = await supabase
      .from("food")
      .insert(newRow);

    if (error) {
      console.error("Failed to insert food entry:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add food entry" },
        { status: 500 }
      );
    }

    // Also save to food_info table to grow the database
    try {
      // Check if this food already exists in the food_info table
      const { data: existingFood } = await supabase
        .from('food_info')
        .select('id')
        .eq('foodName', body.foodName)
        .limit(1);

      // If food doesn't exist yet, add it to the food_info table
      if (!existingFood || existingFood.length === 0) {
        await supabase
          .from('food_info')
          .insert({
            user_id: userData.id,
            foodName: body.foodName,
            brand: body.brands || null,
            serving_size: parseFloat(body.serving_size?.toString() || "0"),
            serving_unit: body.unit,
            calories: body.calories || autoCalculatedCalories,
            protein: body.protein || 0,
            carbs: body.carbs || 0,
            fat: body.fats || 0,
            fiber: body.fiber || 0,
            sugar: body.sugar || 0,
            sodium: body.sodium || 0,
            potassium: body.potassium || 0,
            calcium: body.calcium || 0,
            iron: body.iron || 0,
            vitamin_a: body.vitamin_a || 0,
            vitamin_c: body.vitamin_c || 0,
            magnesium: body.magnesium || 0,
            phosphorus: body.phosphorus || 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
      }
    } catch (foodInfoError) {
      // Log the error but don't fail the main operation
      console.error("Failed to save to food_info table:", foodInfoError);
    }

    return NextResponse.json({ message: "Food entry added successfully!" });
  } catch (error: any) {
    console.error("Failed to add food entry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add food entry" },
      { status: 500 }
    );
  }
}