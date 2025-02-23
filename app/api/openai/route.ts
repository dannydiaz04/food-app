import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env.local
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const prompt = formData.get("prompt")
    const image = formData.get("image")
    const apiKey = process.env.OPENAI_API_KEY

    let responseText = ""

    if (prompt) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // or "gpt-4" if you have access
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        //   max_tokens: 100, // testing and debugging
        }),
      })

      const data = await response.json()

      if (data.choices && data.choices.length > 0) {
        responseText = data.choices[0].message.content
      } else {
        responseText = "No response from OpenAI API."
      }
    }

    if (image) {
      // Convert image to base64
      const imageBuffer = await image.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString("base64")
      console.log("Base64 Image:", base64Image) // Log the base64 image

      // Call OpenAI Vision API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "What is in this image?" },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
              ],
            },
          ],
          max_tokens: 200,
        }),
      })

      const data = await response.json()
      responseText = data.choices?.[0]?.message?.content || "No response from OpenAI Vision API."
    }

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error)
    return NextResponse.json({ error: "Failed to fetch OpenAI response" }, { status: 500 })
  }
}