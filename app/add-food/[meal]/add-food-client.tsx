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
  serving_quantity: string;
  serving_quantity_unit: string;
  fiber: number;
  sodium: number;
  sugar: number;
  zinc: number;
  calcium: number;
  iron: number;
  phosphorus: number;
  magnesium: number;
  potassium: number;
  chloride: number;
  sulfur: number;
  manganese: number;
  copper: number;
  iodine: number;
  cobalt: number;
  fluoride: number;
  selenium: number;
  molybdenum: number;
  chromium: number;
  vitamin_a: number;
  vitamin_b: number;
  vitamin_b1: number;
  vitamin_b2: number;
  vitamin_b3: number;
  vitamin_b5: number;
  vitamin_b6: number;
  vitamin_b7: number;
  vitamin_b9: number;
  vitamin_b12: number;
  vitamin_c: number;
  vitamin_d: number;
  vitamin_e: number;
  vitamin_k: number;
  
  // for debugging
//   nutriments: any; // Contains macro and micronutrient information from OpenFoodFacts
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
        calories: Math.round(product.nutriments ? (product.nutriments["energy-kcal"] || 0) : 0),
        carbs: Math.round(product.nutriments ? (product.nutriments["carbohydrates"] || 0) : 0),
        fats: Math.round(product.nutriments ? (product.nutriments["fat"] || 0) : 0),
        protein: Math.round(product.nutriments ? (product.nutriments["proteins"] || 0) : 0),
        serving_quantity: product.serving_quantity,  // Default quantity – adjust as needed
        serving_quantity_unit: product.serving_quantity_unit,
        fiber: Math.round(product.nutriments ? (product.nutriments["fiber"] || 0) : 0),
        sodium: (product.nutriments ? (product.nutriments["sodium"] || 0) : 0) * 1000, // sodium is in mg
        sugar: product.nutriments ? (product.nutriments["sugars"] || 0) : 0, // sugar is in grams
        zinc: (product.nutriments_estimated ? (product.nutriments_estimated["zinc_100g"] || 0) : 0) * 100000, // zinc is in mg
        calcium: (product.nutriments ? (product.nutriments["calcium"] || 0) : 0) * 1000, // calcium is in mg
        phosphorus: (product.nutriments_estimated ? (product.nutriments_estimated["phosphorus_100g"] || 0) : 0) * 100, // phosphorus is in g
        magnesium: (product.nutriments_estimated ? (product.nutriments_estimated["magnesium_100g"] || 0) : 0) * 100, // magnesium is in g
        iron: (product.nutriments ? (product.nutriments["iron"] || 0) : 0) * 1000, // iron is in mg
        potassium: (product.nutriments ? (product.nutriments["potassium"] || 0) : 0) * 1000, // potassium is in mg
        chloride: (product.nutriments ? (product.nutriments["chloride"] || 0) : 0) * 1000, // chloride is in mg
        sulfur: (product.nutriments ? (product.nutriments["sulfur"] || 0) : 0) * 1000, // sulfur is in mg
        manganese: (product.nutriments_estimated ? (product.nutriments_estimated["manganese_100g"] || 0) : 0) * 100, // manganese is in g
        copper: (product.nutriments_estimated ? (product.nutriments_estimated["copper_100g"] || 0) : 0) * 100, // copper is in g
        iodine: (product.nutriments_estimated ? (product.nutriments_estimated["iodine_100g"] || 0) : 0) * 100, // iodine is in g
        cobalt: (product.nutriments_estimated ? (product.nutriments_estimated["cobalt_100g"] || 0) : 0) * 100, // cobalt is in g
        fluoride: (product.nutriments_estimated ? (product.nutriments_estimated["fluoride_100g"] || 0) : 0) * 100, // fluoride is in g
        selenium: (product.nutriments_estimated ? (product.nutriments_estimated["selenium_100g"] || 0) : 0) * 100, // selenium is in g
        molybdenum: (product.nutriments_estimated ? (product.nutriments_estimated["molybdenum_100g"] || 0) : 0) * 100, // molybdenum is in g
        chromium: (product.nutriments_estimated ? (product.nutriments_estimated["chromium_100g"] || 0) : 0) * 100, // chromium is in g
        vitamin_a: (product.nutriments ? (product.nutriments["vitamin-a"] || 0) : 0) * 100, // vitamin a is in g
        vitamin_b: (product.nutriments ? (product.nutriments["vitamin-b"] || 0) : 0) * 100, // vitamin b is in g
        vitamin_b1: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b1_100g"] || 0) : 0) * 100, // vitamin b1 is in g
        vitamin_b2: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b2_100g"] || 0) : 0) * 100, // vitamin b2 is in g
        vitamin_b3: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b3_100g"] || 0) : 0) * 100, // vitamin b3 is in g
        vitamin_b5: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b5_100g"] || 0) : 0) * 100, // vitamin b5 is in g
        vitamin_b6: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b6_100g"] || 0) : 0) * 100, // vitamin b6 is in g
        vitamin_b7: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b7_100g"] || 0) : 0) * 100, // vitamin b7 is in g
        vitamin_b9: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b9_100g"] || 0) : 0) * 100, // vitamin b9 is in g
        vitamin_b12: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-b12_100g"] || 0) : 0) * 100, // vitamin b12 is in g
        vitamin_c: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-c_100g"] || 0) : 0) * 100, // vitamin c is in g
        vitamin_d: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-d_100g"] || 0) : 0) * 100, // vitamin d is in g
        vitamin_e: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-e_100g"] || 0) : 0) * 100, // vitamin e is in g
        vitamin_k: (product.nutriments_estimated ? (product.nutriments_estimated["vitamin-k_100g"] || 0) : 0) * 100, // vitamin k is in g


        // for debugging
        // nutriments: product.nutriments  // Include full nutrients information (macros and micros)
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