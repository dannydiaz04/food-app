import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the barcode from query params
    const barcode = request.nextUrl.searchParams.get('barcode');
    
    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      );
    }

    // First check if the barcode exists in our food_info table
    const { data: foodInfoData, error: foodInfoError } = await supabase
      .from("food_info")
      .select("*")
      .eq("barcode", barcode)
      .limit(1);

    if (foodInfoData && foodInfoData.length > 0) {
      return NextResponse.json(foodInfoData[0]);
    }

    // If not found in our database, query an external API like Open Food Facts
    // This is just a placeholder - you'll need to implement your own API integration
    const externalResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    
    if (!externalResponse.ok) {
      throw new Error("Failed to fetch food data from external API");
    }
    
    const externalData = await externalResponse.json();
    
    if (externalData.status === 1 && externalData.product) {
      // Map external API data to our format
      const product = externalData.product;
      const nutriments = product.nutriments || {};
      
      const mappedData = {
        foodName: product.product_name || "Unknown Food",
        brands: product.brands || "",
        serving_size: product.serving_size || "100",
        unit: "g",
        calories: nutriments.energy_kcal_100g || nutriments.energy_kcal || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fats: nutriments.fat_100g || 0,
        protein: nutriments.proteins_100g || 0,
        sugar: nutriments.sugars_100g || 0,
        fiber: nutriments.fiber_100g || 0,
        sodium: nutriments.sodium_100g || 0,
        potassium: nutriments.potassium_100g || 0,
        barcode: barcode
      };
      
      return NextResponse.json(mappedData);
    }
    
    // If not found in external API either
    return NextResponse.json(
      { error: "Food not found for this barcode", barcode },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error looking up barcode:", error);
    return NextResponse.json(
      { error: "Failed to look up barcode" },
      { status: 500 }
    );
  }
} 