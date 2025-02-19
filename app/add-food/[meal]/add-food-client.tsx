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
  foodName: string;
  calories: number;
  carbs: number;
  fats: number;
  protein: number;
  quantity: number;
  unit: string;
  nutriments: any; // Contains macro and micronutrient information from OpenFoodFacts
}

export function AddFoodClient({ meal }: AddFoodClientProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scannedProduct, setScannedProduct] = useState<FoodProduct | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleBarcodeDetected(barcode: string) {
    try {
      setIsLoading(true)

      // Use the OpenFoodFacts API endpoint to look up the product by barcode.
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch product from OpenFoodFacts")
      }
      
      const data = await response.json()
      console.log("OpenFoodFacts response:", data)
      
      if (data.status !== 1) {
        throw new Error("Product not found in OpenFoodFacts")
      }
      
      const product = data.product
      
      // Map the returned product data into your FoodProduct type.
      const scannedProductData: FoodProduct = {
        foodName: product.product_name || "Unnamed product",
        calories: Math.round(product.nutriments ? (product.nutriments["energy-kcal_100g"] || 0) : 0),
        carbs: Math.round(product.nutriments ? (product.nutriments["carbohydrates_100g"] || 0) : 0),
        fats: Math.round(product.nutriments ? (product.nutriments["fat_100g"] || 0) : 0),
        protein: Math.round(product.nutriments ? (product.nutriments["proteins_100g"] || 0) : 0),
        quantity: 1,  // Default quantity – adjust as needed
        unit: "serving",
        nutriments: product.nutriments  // Include full nutrients information (macros and micros)
      }

      console.log("Scanned product data from OpenFoodFacts:", scannedProductData)

      // Display the returned data in the UI (or POST it to an API endpoint as needed)
      setScannedProduct(scannedProductData)
      setShowScanner(false)
      setScanError(null)
    } catch (error: any) {
      console.error("Error processing barcode:", error)
      setScanError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleScanError(error: Error) {
    console.error("Barcode scan error:", error)
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
            Added to {meal}: {scannedProduct.foodName} <br />
            Calories: {scannedProduct.calories} cal, 
            Carbs: {scannedProduct.carbs}g, 
            Fats: {scannedProduct.fats}g, 
            Protein: {scannedProduct.protein}g <br />
            <small>
              Full Nutriments: {JSON.stringify(scannedProduct.nutriments)}
            </small>
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