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

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition label analyzer. Extract information from nutrition labels and return it in clean JSON format without markdown formatting, code blocks, or any additional text."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this nutrition label and extract the following information in JSON format: serving size (with unit preferably in grams), calories, total carbohydrates, dietary fiber, total sugars, added sugars, total fat, saturated fat, trans fat, protein, and any vitamins or minerals listed. If a value is not found, return null for that field.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Get the content from the response
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
    } else if (content.includes("```")) {
      // Handle case where code block doesn't specify language
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedContent = jsonMatch[1].trim();
      }
    }
    
    try {
      // Parse the cleaned JSON
      const nutritionData = JSON.parse(cleanedContent);
      return NextResponse.json(nutritionData);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Content received:", content);
      console.error("Cleaned content:", cleanedContent);
      return NextResponse.json(
        { error: "Failed to parse nutrition data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
} 