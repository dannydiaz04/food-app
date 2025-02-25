import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
          content: "You are a nutrition expert. Analyze the food description and provide nutritional information in JSON format. Return ONLY the JSON object with no markdown formatting, code blocks, or additional text."
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

    // Extract the content from the response
    const content = response.choices[0].message.content || "{}";
    
    // Clean up the content to handle markdown formatting
    let cleanedContent = content;
    
    // Check if the content is wrapped in markdown code blocks
    if (content.includes("```json")) {
      // Extract the JSON part from the markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedContent = jsonMatch[1].trim();
      }
    }
    
    // Parse the JSON
    const foodData = JSON.parse(cleanedContent);

    // Get the user's ID from Supabase using their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userError && userData) {
      // Try to save the food to the food_info table
      try {
        // Check if this food already exists
        const { data: existingFood } = await supabase
          .from('food_info')
          .select('id')
          .eq('foodName', foodData.foodName)
          .limit(1);

        // If food doesn't exist yet, add it
        if (!existingFood || existingFood.length === 0) {
          await supabase
            .from('food_info')
            .insert({
              user_id: userData.id,
              foodName: foodData.foodName,
              serving_size: foodData.serving_size || 100,
              serving_unit: 'g',
              calories: foodData.calories || 0,
              protein: foodData.protein || 0,
              carbs: foodData.carbs || 0,
              fat: foodData.fats || 0,
              fiber: foodData.fiber || 0,
              sugar: foodData.sugar || 0,
              created_at: new Date(),
              updated_at: new Date(),
            });
        }
      } catch (saveError) {
        // Log but don't interrupt the main flow
        console.error("Error saving to food_info:", saveError);
      }
    }

    return NextResponse.json(foodData);
  } catch (error) {
    console.error("Error processing text:", error);
    return NextResponse.json(
      { error: "Failed to process text" },
      { status: 500 }
    );
  }
} 