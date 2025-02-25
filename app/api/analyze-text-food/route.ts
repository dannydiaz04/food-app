import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert. Analyze the food description and provide nutritional information in JSON format."
        },
        {
          role: "user",
          content: `Analyze this food description and provide the following information in JSON format: 
          foodName (a concise name for this entry), 
          serving_size (estimated weight in grams), 
          calories (estimated calories), 
          carbs (estimated carbs in grams), 
          fats (estimated fats in grams), 
          protein (estimated protein in grams), 
          sugar (estimated sugar in grams), 
          fiber (estimated fiber in grams).
          
          If multiple food items are mentioned, combine them into a single entry with total nutritional values.
          
          Food description: "${text}"`
        }
      ],
      max_tokens: 1000,
    });

    const foodData = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json(foodData);
  } catch (error) {
    console.error("Error processing text:", error);
    return NextResponse.json(
      { error: "Failed to process text" },
      { status: 500 }
    );
  }
} 