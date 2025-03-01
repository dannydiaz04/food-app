import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    // Get the user's ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Insert into food_info table
    const { data, error } = await supabase
      .from("food_info")
      .insert({
        user_id: userData.id,
        foodName: body.foodName,
        serving_size: parseFloat(body.serving_size?.toString() || "0"),
        serving_unit: body.unit || "g",
        calories: body.calories || 0,
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
        // Add other nutrients as available in the body
      });

    if (error) {
      console.error("Error saving to food_info:", error);
      return NextResponse.json(
        { error: "Failed to save to food database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Food saved to database successfully" 
    });
  } catch (error) {
    console.error("Error saving to food database:", error);
    return NextResponse.json(
      { error: "Failed to save to food database" },
      { status: 500 }
    );
  }
} 