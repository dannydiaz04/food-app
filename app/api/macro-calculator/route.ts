import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize a Supabase client using the service role key on the server.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Prepare the row data for the "food" table.
    // Ensure your Supabase "food" table has matching columns:
    // date, meal, foodname, quantity, unit, calories, carbs, fats, protein, etc.
    const newRow = {
      date: body.date || new Date().toISOString(),
      meal: body.meal,
      foodname: body.foodName || "Custom Entry", // Adjust the column names as needed.
      quantity: body.quantity ? Number(body.quantity) : 1,
      unit: body.unit || "serving",
      calories: body.calories,
      carbs: body.carbs,
      fats: body.fats,
      protein: body.protein,
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

    return NextResponse.json({ message: "Food entry added successfully!" });
  } catch (error: any) {
    console.error("Failed to add food entry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add food entry" },
      { status: 500 }
    );
  }
}