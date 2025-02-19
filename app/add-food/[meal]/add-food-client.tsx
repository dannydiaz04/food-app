"use client"

import { useState } from "react"
import { AddFood } from "@/components/add-food"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Scan } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

// Dynamically import BarcodeScanner with no SSR
const BarcodeScanner = dynamic(
  () => import('@/components/barcode-scanner'),
  { ssr: false }
)

interface AddFoodClientProps {
  meal: string
}

interface FoodProduct {
  food_ky: string
  foodName: string
  calories: number
  carbs: number
  fats: number
  protein: number
  quantity: number
  unit: string
}

export function AddFoodClient({ meal }: AddFoodClientProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<FoodProduct | null>(null)

  const handleBarcodeDetected = async (value: string) => {
    console.log("Barcode detected:", value)
    setLastScannedCode(value)
    setShowScanner(false)
    setScanError(null)
    setIsLoading(true)

    try {
      // First try OpenFoodFacts API
      const openFoodResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${value}.json`)
      const openFoodData = await openFoodResponse.json()
      
      console.log("OpenFoodFacts response:", openFoodData)

      if (openFoodData.status === 1) {
        const product = openFoodData.product
        const nutriments = product.nutriments

        // Convert OpenFoodFacts data to our format
        const foodData = {
          food_ky: value, // Using barcode as key
          foodName: product.product_name,
          calories: nutriments['energy-kcal_100g'] || 0,
          carbs: nutriments.carbohydrates_100g || 0,
          fats: nutriments.fat_100g || 0,
          protein: nutriments.proteins_100g || 0,
          quantity: 100, // Default to 100g serving
          unit: 'g',
          barcode: value
        }

        console.log("Processed food data:", foodData)

        // Store the food in our database
        const storeResponse = await fetch('/api/macro-calculator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...foodData,
            meal: meal,
            date: new Date().toISOString(),
          }),
        })

        if (!storeResponse.ok) {
          throw new Error('Failed to store food data')
        }

        setScannedProduct(foodData)
      } else {
        throw new Error('Product not found in OpenFoodFacts database')
      }

    } catch (error) {
      console.error("Error processing barcode:", error)
      setScanError(error instanceof Error ? error.message : 'Failed to look up product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanError = (error: Error) => {
    console.error("Scan error:", error)
    setScanError(error.message)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setShowScanner(!showScanner)
            setScanError(null)
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Scan className="w-4 h-4" />
          {showScanner ? 'Hide Scanner' : 'Scan Barcode'}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Alert className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Looking up product...
          </AlertDescription>
        </Alert>
      )}

      {/* Show scanned product */}
      {scannedProduct && !isLoading && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Added to {meal}: {scannedProduct.foodName} 
            ({scannedProduct.calories} cal, 
            {scannedProduct.carbs}g carbs, 
            {scannedProduct.fats}g fats, 
            {scannedProduct.protein}g protein)
          </AlertDescription>
        </Alert>
      )}

      {/* Show any scanner errors */}
      {scanError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {scanError}
          </AlertDescription>
        </Alert>
      )}

      {showScanner && (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <BarcodeScanner 
              onDetected={handleBarcodeDetected}
              onError={handleScanError}
            />
          </div>
        </div>
      )}

      <AddFood meal={meal} />
    </div>
  )
} 