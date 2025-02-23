"use client"

import { useState } from "react"

export function TestOpenAI() {
  const [inputText, setInputText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()

      if (inputText) {
        formData.append("prompt", inputText)
      }
      if (image) {
        formData.append("image", image)
      }

      const res = await fetch("/api/openai", {
        method: "POST",
        body: formData,
      })
      
      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      console.error("Error fetching OpenAI response:", error)
      setResponse("Error fetching response")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text for AI generation"
          className="w-full p-2 border rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          className="mt-2 w-full p-2 border rounded"
        />

        {image && (
          <div className="mt-2">
            <p>Selected Image: {image.name}</p>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-1 p-1 bg-red-500 text-white rounded"
            >
              Remove Image
            </button>
          </div>
        )}

        <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded">
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {response && <div className="mt-4 p-2 border rounded">{response}</div>}
    </div>
  )
}

export default TestOpenAI