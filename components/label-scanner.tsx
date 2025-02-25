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
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
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
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)
    const imageDataUrl = canvas.toDataURL('image/jpeg')
    setImage(imageDataUrl)
    stopCamera()
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

      // Convert the nutrition data to our FoodItem format
      const foodItem: FoodItem = {
        food_ky: Date.now().toString(), // Temporary ID
        foodName: "Scanned Food Item",
        brands: "",
        unit: nutritionData.serving_size_unit || "g",
        serving_size: nutritionData.serving_size?.toString() || "100",
        serving_size_g: nutritionData.serving_size || 100,
        serving_size_imported: nutritionData.serving_size,
        product_quantity_unit: nutritionData.serving_size_unit || "g",
        serving_quantity: nutritionData.serving_size || 100,
        serving_quantity_unit: nutritionData.serving_size_unit || "g",
        perGramValues: {
          calories: (nutritionData.calories || 0) / 100,
          carbs: (nutritionData.total_carbohydrates || 0) / 100,
          fats: (nutritionData.total_fat || 0) / 100,
          protein: (nutritionData.protein || 0) / 100,
          sugar: (nutritionData.total_sugars || 0) / 100,
          fiber: (nutritionData.dietary_fiber || 0) / 100,
          vitamin_a: (nutritionData.vitamin_a || 0) / 100,
          vitamin_c: (nutritionData.vitamin_c || 0) / 100,
          calcium: (nutritionData.calcium || 0) / 100,
          iron: (nutritionData.iron || 0) / 100,
          magnesium: (nutritionData.magnesium || 0) / 100,
          phosphorus: (nutritionData.phosphorus || 0) / 100,
          potassium: (nutritionData.potassium || 0) / 100,
          sodium: (nutritionData.sodium || 0) / 100,
        },
        calories: nutritionData.calories || 0,
        carbs: nutritionData.total_carbohydrates || 0,
        fats: nutritionData.total_fat || 0,
        protein: nutritionData.protein || 0,
        sugar: nutritionData.total_sugars || 0,
        fiber: nutritionData.dietary_fiber || 0,
        vitamin_a: nutritionData.vitamin_a || 0,
        vitamin_c: nutritionData.vitamin_c || 0,
        calcium: nutritionData.calcium || 0,
        iron: nutritionData.iron || 0,
        magnesium: nutritionData.magnesium || 0,
        phosphorus: nutritionData.phosphorus || 0,
        potassium: nutritionData.potassium || 0,
        sodium: nutritionData.sodium || 0,
      }

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

  const handleMealEntryConfirm = async (updatedFood: FoodItem) => {
    try {
      setIsProcessing(true)
      
      // Save the food entry
      const response = await fetch('/api/macro-calculator', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedFood,
          date: new Date().toISOString(),
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save food entry")
      }
      
      // Show confirmation dialog
      setShowConfirmation(true)
      
      // Close meal entry dialog
      setShowMealEntry(false)
      setScannedFood(null)
      
      // Reset camera after a short delay
      setTimeout(resetCamera, 2000)
    } catch (err) {
      console.error("Error saving food entry:", err)
      setError('Failed to save food entry')
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

            <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
              <img
                src={image}
                alt="Captured nutrition label"
                className="absolute inset-0 w-full h-full object-contain"
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