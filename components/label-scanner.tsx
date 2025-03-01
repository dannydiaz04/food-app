"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, RotateCcw, Loader2, X } from "lucide-react"
import { MealEntry } from "@/components/meal-entry"
import type { FoodItem } from "@/types/food"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function LabelScanner() {
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMealEntry, setShowMealEntry] = useState(false)
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [viewportDimensions, setViewportDimensions] = useState({ 
    width: 0, height: 0, offsetX: 0, offsetY: 0, scale: 1 
  });

  useEffect(() => {
    if (cameraActive && videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err)
        setError("Could not start camera feed")
      })
    }
  }, [cameraActive])

  const startCamera = async () => {
    try {
      setCameraActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Wait for video metadata to load to get actual dimensions
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;
          
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          const containerWidth = videoRef.current.clientWidth;
          const containerHeight = videoRef.current.clientHeight;
          
          // Calculate scaling and positioning to match what's visible in the viewport
          const videoRatio = videoWidth / videoHeight;
          const containerRatio = containerWidth / containerHeight;
          
          let scale, offsetX, offsetY;
          
          if (videoRatio > containerRatio) {
            // Video is wider than container
            scale = containerHeight / videoHeight;
            offsetX = (containerWidth - videoWidth * scale) / 2;
            offsetY = 0;
          } else {
            // Video is taller than container
            scale = containerWidth / videoWidth;
            offsetX = 0;
            offsetY = (containerHeight - videoHeight * scale) / 2;
          }
          
          setViewportDimensions({
            width: videoWidth,
            height: videoHeight,
            offsetX,
            offsetY,
            scale
          });
        };
        
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error("Error playing video:", playError)
        }
      }
    } catch (err) {
      setCameraActive(false)
      setError('Failed to access camera')
      console.error(err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const { width, height, offsetX, offsetY, scale } = viewportDimensions;
    
    // Set canvas to the size of the video
    canvas.width = videoRef.current.clientWidth;
    canvas.height = videoRef.current.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate the source rectangle from the video that's actually visible
    const sourceWidth = canvas.width / scale;
    const sourceHeight = canvas.height / scale;
    
    // Calculate source position to center the crop
    const sourceX = (width - sourceWidth) / 2;
    const sourceY = (height - sourceHeight) / 2;
    
    // Draw only the visible portion of the video
    ctx.drawImage(
      videoRef.current,
      sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
      0, 0, canvas.width, canvas.height // Destination rectangle
    );
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setImage(imageDataUrl);
    stopCamera();
  }

  const resetCamera = () => {
    setImage(null)
    setError(null)
    setIsProcessing(false)
    startCamera()
  }

  const processImage = async () => {
    if (!image) return

    setIsProcessing(true)
    setError(null)

    try {
      // Convert base64 to blob
      const response = await fetch(image)
      const blob = await response.blob()

      // Create form data
      const formData = new FormData()
      formData.append('image', blob)

      // Send to our API
      const apiResponse = await fetch('/api/scan-label', {
        method: 'POST',
        body: formData,
      })

      if (!apiResponse.ok) {
        throw new Error('Failed to process image')
      }

      const nutritionData = await apiResponse.json()
      console.log("Label scan response:", nutritionData)

      // Make sure all the nutritional values are numbers
      const ensureNumber = (value: any) => {
        const num = parseFloat(value)
        return isNaN(num) ? 0 : num // Return 0 for any NaN values
      }

      // Convert the nutrition data to our FoodItem format
      const foodItem: FoodItem = {
        food_ky: Date.now().toString(), // Temporary ID
        foodName: nutritionData.foodName || "Scanned Food Item",
        brands: nutritionData.brand || "",
        unit: "g",
        serving_size: ensureNumber(nutritionData.serving_size || 100),
        serving_size_g: ensureNumber(nutritionData.serving_size || 100),
        serving_size_imported: nutritionData.serving_size,
        product_quantity_unit: "g",
        serving_quantity: ensureNumber(nutritionData.serving_size || 100),
        serving_quantity_unit: "g",
        perGramValues: {
          calories: ensureNumber(nutritionData.calories) / 100,
          carbs: ensureNumber(nutritionData.carbs) / 100,
          fats: ensureNumber(nutritionData.fat || nutritionData.fats) / 100,
          protein: ensureNumber(nutritionData.protein) / 100,
          sugar: ensureNumber(nutritionData.sugar || nutritionData.sugars) / 100,
          fiber: ensureNumber(nutritionData.fiber) / 100,
          vitamin_a: ensureNumber(nutritionData.vitamin_a) / 100,
          vitamin_c: ensureNumber(nutritionData.vitamin_c) / 100,
          calcium: ensureNumber(nutritionData.calcium) / 100,
          iron: ensureNumber(nutritionData.iron) / 100,
          magnesium: ensureNumber(nutritionData.magnesium) / 100,
          phosphorus: ensureNumber(nutritionData.phosphorus) / 100,
          potassium: ensureNumber(nutritionData.potassium) / 100,
          sodium: ensureNumber(nutritionData.sodium) / 100,
        },
        calories: ensureNumber(nutritionData.calories),
        carbs: ensureNumber(nutritionData.carbs),
        fats: ensureNumber(nutritionData.fat || nutritionData.fats),
        protein: ensureNumber(nutritionData.protein),
        sugar: ensureNumber(nutritionData.sugar || nutritionData.sugars),
        fiber: ensureNumber(nutritionData.fiber),
        vitamin_a: ensureNumber(nutritionData.vitamin_a),
        vitamin_c: ensureNumber(nutritionData.vitamin_c),
        calcium: ensureNumber(nutritionData.calcium),
        iron: ensureNumber(nutritionData.iron),
        magnesium: ensureNumber(nutritionData.magnesium),
        phosphorus: ensureNumber(nutritionData.phosphorus),
        potassium: ensureNumber(nutritionData.potassium),
        sodium: ensureNumber(nutritionData.sodium),
      }

      console.log("Converted foodItem:", foodItem)
      
      setScannedFood(foodItem)
      setShowMealEntry(true)
      setIsProcessing(false)
    } catch (err) {
      console.error("Error processing image:", err)
      setError('Failed to process image. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleMealEntryClose = () => {
    setShowMealEntry(false)
    setScannedFood(null)
  }

  const handleMealEntryConfirm = async (foodData: any, saveToFoodInfo: boolean) => {
    try {
      setIsProcessing(true)
      
      // Current logic to save the food entry
      const response = await fetch("/api/macro-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foodData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save food entry")
      }
      
      // If the user wants to save to food_info table
      if (saveToFoodInfo) {
        await fetch("/api/save-to-food-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(foodData),
        })
      }
      
      setShowMealEntry(false)
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error saving food entry:", error)
      setError("Failed to save food entry")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative">
      {!cameraActive && !image && (
        <div className="flex flex-col items-center justify-center p-4">
          <Button onClick={startCamera} className="mb-2">
            <Camera className="mr-2 h-4 w-4" /> Open Camera
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Take a clear photo of the nutrition label
          </p>
        </div>
      )}

      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute w-full h-full object-cover"
          />
          
          {/* Add guide overlay for label scanning */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-opacity-70 rounded-lg w-[80%] h-[60%]"></div>
            </div>
            <div className="absolute top-8 left-0 right-0 text-center">
              <p className="text-white font-medium text-shadow">Position nutrition label in frame</p>
            </div>
          </div>
          
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
            onClick={stopCamera}
            variant="ghost"
            className="absolute top-4 right-4 text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}

      {image && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="relative bg-black rounded-lg overflow-hidden" 
                 style={{height: "calc(100vh - 300px)", maxHeight: "500px"}}>
              <img
                src={image}
                alt="Captured image"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={resetCamera}
                disabled={isProcessing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={processImage}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Image'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <MealEntry
        isOpen={showMealEntry}
        onClose={handleMealEntryClose}
        onConfirm={handleMealEntryConfirm}
        selectedFood={scannedFood}
      />

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Your food has been added successfully.</p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowConfirmation(false)}
              className="w-full sm:w-auto"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}