import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FoodItem } from "@/types/food"
import { Camera, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TextPromptEntryProps {
  onFoodAnalyzed: (food: FoodItem) => void
}

export function TextPromptEntry({ onFoodAnalyzed }: TextPromptEntryProps) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsProcessing(true)
    setError(null)
    setProgress(10)
    setProcessingStage("Initializing analysis...")

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
        
        // Update processing stage messages
        if (progress < 30) {
          setProcessingStage("Analyzing food description...")
        } else if (progress < 60) {
          setProcessingStage("Calculating nutritional values...")
        } else if (progress < 90) {
          setProcessingStage("Finalizing results...")
        }
      }, 700)

      const response = await fetch('/api/analyze-text-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      clearInterval(progressInterval)
      setProgress(100)
      setProcessingStage("Analysis complete!")

      if (!response.ok) {
        throw new Error('Failed to analyze food')
      }

      const foodData = await response.json()
      console.log("Received food data:", foodData)

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

      console.log("Created food item:", foodItem)
      onFoodAnalyzed(foodItem)
      setText("") // Clear the input after successful analysis
    } catch (err) {
      console.error('Error analyzing food text:', err)
      setError('Failed to analyze food description')
    } finally {
      setIsProcessing(false)
      setProgress(0)
      setProcessingStage("")
    }
  }

  const startCamera = () => {
    setShowCamera(true)
  }

  const captureImage = () => {
    // Camera capture logic would go here
    setShowCamera(false)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Describe Your Food</h3>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Describe your food in detail (e.g., '2 scrambled eggs with 1 slice of whole wheat toast and 1 tbsp butter')"
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

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm text-center text-muted-foreground">{processingStage}</p>
            </div>
          )}

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