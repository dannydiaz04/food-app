import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    // Call the OpenFoodFacts API
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=25`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from OpenFoodFacts")
    }

    const data = await response.json()

    // Transform and clean the data
    const products = data.products.map((product: any) => ({
      code: product.code,
      product_name: product.product_name || "Unknown Product",
      brands: product.brands || "Unknown Brand",
      serving_size: product.serving_size || "100g",
      nutriments: {
        "energy-kcal_100g": product.nutriments["energy-kcal_100g"],
        carbohydrates_100g: product.nutriments.carbohydrates_100g,
        fat_100g: product.nutriments.fat_100g,
        proteins_100g: product.nutriments.proteins_100g,
        sodium_100g: product.nutriments.sodium_100g,
        sugars_100g: product.nutriments.sugars_100g,
        fiber_100g: product.nutriments.fiber_100g,
      }
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Database search error:", error)
    return NextResponse.json(
      { error: "Failed to search food database" },
      { status: 500 }
    )
  }
} 