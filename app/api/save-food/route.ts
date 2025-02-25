import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
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

    const foodItem = await request.json();

    // Check if this food already exists in the food_info table
    const { data: existingFood } = await supabase
      .from('food_info')
      .select('id')
      .eq('foodName', foodItem.foodName)
      .limit(1);

    // If food already exists, don't add it again
    if (existingFood && existingFood.length > 0) {
      return NextResponse.json({ 
        message: "Food already exists in database",
        id: existingFood[0].id
      });
    }

    // Insert the food item into the food_info table
    const { data, error } = await supabase
      .from('food_info')
      .insert({
        user_id: userData.id,
        foodName: foodItem.foodName,
        brand: foodItem.brands || null,
        serving_size: parseFloat(foodItem.serving_size.toString()),
        serving_unit: foodItem.unit,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fats,
        fiber: foodItem.fiber || 0,
        sugar: foodItem.sugar || 0,
        sodium: foodItem.sodium || 0,
        potassium: foodItem.potassium || 0,
        calcium: foodItem.calcium || 0,
        iron: foodItem.iron || 0,
        vitamin_a: foodItem.vitamin_a || 0,
        vitamin_c: foodItem.vitamin_c || 0,
        magnesium: foodItem.magnesium || 0,
        phosphorus: foodItem.phosphorus || 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select();

    if (error) {
      console.error("Error saving food:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Food saved successfully',
      id: data[0].id
    });
  } catch (error) {
    console.error('Error saving food:', error);
    return NextResponse.json(
      { error: 'Failed to save food' },
      { status: 500 }
    );
  }
} 