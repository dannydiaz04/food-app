import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate fetching data from a database or API
    const foods = [
      { id: 1, name: "Pizza", description: "Delicious pizza" },
      { id: 2, name: "Burger", description: "Juicy burger" },
      { id: 3, name: "Salad", description: "Healthy salad" },
    ]

    return NextResponse.json(foods)
  } catch (error) {
    console.error("Error fetching foods:", error)
    return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 })
  }
}

