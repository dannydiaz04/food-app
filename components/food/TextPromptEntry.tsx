import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FoodItem } from "@/types/food"

interface TextPromptEntryProps {
  onFoodAnalyzed: (food: FoodItem) => void
}

export function TextPromptEntry({ onFoodAnalyzed }: TextPromptEntryProps) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-text-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze food')
      }

      const foodData = await response.json()

      // Convert the nutrition data to our FoodItem format
      const foodItem: FoodItem = {
        food_ky: Date.now().toString(), // Temporary ID
        foodName: foodData.foodName || "Food from text",
        brands: "",
        unit: "g",
        serving_size: foodData.serving_size?.toString() || "100",
        serving_size_g: foodData.serving_size || 100,
        serving_size_imported: foodData.serving_size,
        product_quantity_unit: "g",
        serving_quantity: foodData.serving_size || 100,
        serving_quantity_unit: "g",
        perGramValues: {
          calories: (foodData.calories || 0) / (foodData.serving_size || 100),
          carbs: (foodData.carbs || 0) / (foodData.serving_size || 100),
          fats: (foodData.fats || 0) / (foodData.serving_size || 100),
          protein: (foodData.protein || 0) / (foodData.serving_size || 100),
          sugar: (foodData.sugar || 0) / (foodData.serving_size || 100),
          fiber: (foodData.fiber || 0) / (foodData.serving_size || 100),
          vitamin_a: 0,
          vitamin_c: 0,
          calcium: 0,
          iron: 0,
          magnesium: 0,
          phosphorus: 0,
          potassium: 0,
          sodium: 0,
        },
        calories: foodData.calories || 0,
        carbs: foodData.carbs || 0,
        fats: foodData.fats || 0,
        protein: foodData.protein || 0,
        sugar: foodData.sugar || 0,
        fiber: foodData.fiber || 0,
        vitamin_a: 0,
        vitamin_c: 0,
        calcium: 0,
        iron: 0,
        magnesium: 0,
        phosphorus: 0,
        potassium: 0,
        sodium: 0,
      }

      onFoodAnalyzed(foodItem)
      setText("") // Clear the input after successful analysis
    } catch (err) {
      console.error('Error analyzing food text:', err)
      setError('Failed to analyze food description')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="food-text" className="block text-sm font-medium mb-2">
              Describe what you ate
            </label>
            <Textarea
              id="food-text"
              placeholder="Example: 2 slices of whole wheat toast with 1 tbsp peanut butter and a medium banana"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include quantities (cups, tbsp, oz) when possible for more accurate results
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !text.trim()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Food'
            )}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground">
          <h4 className="font-medium">Tips for best results:</h4>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Include quantities when possible (e.g., "2 eggs" instead of just "eggs")</li>
            <li>Specify cooking methods (e.g., "grilled chicken" vs "fried chicken")</li>
            <li>Mention brands for packaged foods if known</li>
            <li>List all ingredients for homemade dishes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 