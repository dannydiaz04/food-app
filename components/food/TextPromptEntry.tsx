import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FoodItem } from "@/types/food"
import { Camera, X } from "lucide-react"

interface TextPromptEntryProps {
  onFoodAnalyzed: (food: FoodItem) => void
}

export function TextPromptEntry({ onFoodAnalyzed }: TextPromptEntryProps) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

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
          calories: (foodData.calories || 0) / 100,
          carbs: (foodData.carbs || 0) / 100,
          fats: (foodData.fats || 0) / 100,
          protein: (foodData.protein || 0) / 100,
          sugar: (foodData.sugar || 0) / 100,
          fiber: (foodData.fiber || 0) / 100,
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

  const captureImage = () => {
    if (!videoRef) return;
    
    const video = videoRef as unknown as HTMLVideoElement;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    // Process the image or send it to your API
    console.log("Image captured:", imageDataUrl);
    
    // Close the camera
    setShowCamera(false);
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
            <li>Include quantities when possible (e.g., &quot;2 eggs&quot; instead of just &quot;eggs&quot;)</li>
            <li>Specify cooking methods (e.g., &quot;grilled chicken&quot; vs &quot;fried chicken&quot;)</li>
            <li>Mention brands for packaged foods if known</li>
            <li>List all ingredients for homemade dishes</li>
          </ul>
        </div>

        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <Button
                onClick={captureImage}
                size="lg"
                className="rounded-full h-16 w-16 flex items-center justify-center"
              >
                <Camera className="h-8 w-8" />
              </Button>
            </div>
            
            <Button
              onClick={() => setShowCamera(false)}
              variant="ghost"
              className="absolute top-4 right-4 text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 