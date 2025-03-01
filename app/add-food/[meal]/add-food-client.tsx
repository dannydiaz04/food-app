"use client"

import { useState, useEffect, useRef } from "react"
import { AddFood } from "@/components/add-food"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Scan, X, RotateCcw, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useSearchParams, useRouter } from 'next/navigation'
import { MealEntry } from "@/components/meal-entry"
import { Card, CardContent } from "@/components/ui/card"
import type { FoodItem } from "@/types/food"

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
  calories: number | '';
  carbs: number | '';
  fats: number | '';
  protein: number | '';
  serving_quantity: string;
  serving_quantity_unit: string;
  fiber: number | '';
  sodium: number | '';
  sugar: number | '';
  zinc: number | '';
  calcium: number | '';
  iron: number | '';
  phosphorus: number | '';
  magnesium: number | '';
  potassium: number | '';
  chloride: number | '';
  sulfur: number | '';
  manganese: number | '';
  copper: number | '';
  iodine: number | '';
  cobalt: number | '';
  fluoride: number | '';
  selenium: number | '';
  molybdenum: number | '';
  chromium: number | '';
  vitamin_a: number | '';
  vitamin_b: number | '';
  vitamin_b1: number | '';
  vitamin_b2: number | '';
  vitamin_b3: number | '';
  vitamin_b5: number | '';
  vitamin_b6: number | '';
  vitamin_b7: number | '';
  vitamin_b9: number | '';
  vitamin_b12: number | '';
  vitamin_c: number | '';
  vitamin_d: number | '';
  vitamin_e: number | '';
  vitamin_k: number | '';
  
  // for debugging
//   nutriments: any; // Contains macro and micronutrient information from OpenFoodFacts
}

interface FoodItem {
  food_ky: string;
  foodName: string;
  brands: string;
  unit: string;
  serving_size: string;
  serving_size_g: number;
  serving_size_imported: string | number | null;
  product_quantity_unit: string;
  serving_quantity: number;
  serving_quantity_unit: string;
  perGramValues: {
    calories: number;
    carbs: number;
    fats: number;
    protein: number;
    sugar: number;
    fiber: number;
    vitamin_a: number;
    vitamin_c: number;
    calcium: number;
    iron: number;
    magnesium: number;
    phosphorus: number;
    potassium: number;
    sodium: number;
  };
  calories: number;
  carbs: number;
  fats: number;
  protein: number;
  sugar: number;
  fiber: number;
  vitamin_a: number;
  vitamin_c: number;
  calcium: number;
  iron: number;
  magnesium: number;
  phosphorus: number;
  potassium: number;
  sodium: number;
}

// Helper function to map OpenFoodFacts units to our dropdown options
const mapUnit = (unit: string): string => {
  const unitMap: { [key: string]: string } = {
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'oz': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'tbsp': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'tsp': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'cup': 'cup',
    'cups': 'cup'
  };
  
  return unitMap[unit.toLowerCase()] || 'g';
};

export function AddFoodClient({ meal }: AddFoodClientProps) {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const barcodeParam = searchParams.get('barcode')
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    if (dateParam) {
      setCurrentDate(new Date(dateParam))
    } else {
      setCurrentDate(new Date())
    }
  }, [dateParam])

  const [showScanner, setShowScanner] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null)
  const [foodImage, setFoodImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMealEntry, setShowMealEntry] = useState(false)
  const scannerRef = useRef<{ stopCamera: () => void } | null>(null)

  useEffect(() => {
    if (barcodeParam) {
      handleBarcodeDetected(barcodeParam);
    }
  }, [barcodeParam]);

  // Make sure to clean up scanner if component unmounts while scanner is active
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stopCamera();
      }
    };
  }, []);

  async function handleBarcodeDetected(barcode: string) {
    try {
      setIsLoading(true);
      console.log('Processing barcode:', barcode);

      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      console.log('API Response status:', response.status); // Debug log
      
      const data = await response.json();
      console.log('API Response data:', data); // Debug log
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      if (data.status !== 1 || !data.product) {
        throw new Error("Product not found in OpenFoodFacts");
      }
      
      const product = data.product;
      const nutriments = product.nutriments || {};
      
      // Helper function to convert nutriment value
      const getNutrimentValue = (key: string): number | '' => {
        const value = nutriments[key];
        return value ? Math.round(value) : '';
      }

      // Map the returned product data into your FoodProduct type
      const scannedProductData: FoodProduct = {
        foodName: product.product_name || "Unnamed product",
        calories: getNutrimentValue("energy-kcal"),
        carbs: getNutrimentValue("carbohydrates"),
        fats: getNutrimentValue("fat"),
        protein: getNutrimentValue("proteins"),
        serving_quantity: product.serving_quantity || "",
        serving_quantity_unit: product.serving_quantity_unit || "",
        fiber: getNutrimentValue("fiber"),
        sodium: nutriments["sodium"] ? Math.round(nutriments["sodium"] * 1000) : '',
        sugar: getNutrimentValue("sugars"),
        zinc: nutriments["zinc"] ? Math.round(nutriments["zinc"] * 100000) : '',
        calcium: nutriments["calcium"] ? Math.round(nutriments["calcium"] * 1000) : '',
        iron: nutriments["iron"] ? Math.round(nutriments["iron"] * 1000) : '',
        phosphorus: nutriments["phosphorus"] ? Math.round(nutriments["phosphorus"] * 100) : '',
        magnesium: nutriments["magnesium"] ? Math.round(nutriments["magnesium"] * 100) : '',
        potassium: nutriments["potassium"] ? Math.round(nutriments["potassium"] * 1000) : '',
        chloride: nutriments["chloride"] ? Math.round(nutriments["chloride"] * 1000) : '',
        sulfur: nutriments["sulfur"] ? Math.round(nutriments["sulfur"] * 1000) : '',
        manganese: nutriments["manganese"] ? Math.round(nutriments["manganese"] * 100) : '',
        copper: nutriments["copper"] ? Math.round(nutriments["copper"] * 100) : '',
        iodine: nutriments["iodine"] ? Math.round(nutriments["iodine"] * 100) : '',
        cobalt: nutriments["cobalt"] ? Math.round(nutriments["cobalt"] * 100) : '',
        fluoride: nutriments["fluoride"] ? Math.round(nutriments["fluoride"] * 100) : '',
        selenium: nutriments["selenium"] ? Math.round(nutriments["selenium"] * 100) : '',
        molybdenum: nutriments["molybdenum"] ? Math.round(nutriments["molybdenum"] * 100) : '',
        chromium: nutriments["chromium"] ? Math.round(nutriments["chromium"] * 100) : '',
        vitamin_a: nutriments["vitamin-a"] ? Math.round(nutriments["vitamin-a"] * 100) : '',
        vitamin_b: nutriments["vitamin-b"] ? Math.round(nutriments["vitamin-b"] * 100) : '',
        vitamin_b1: nutriments["vitamin-b1"] ? Math.round(nutriments["vitamin-b1"] * 100) : '',
        vitamin_b2: nutriments["vitamin-b2"] ? Math.round(nutriments["vitamin-b2"] * 100) : '',
        vitamin_b3: nutriments["vitamin-b3"] ? Math.round(nutriments["vitamin-b3"] * 100) : '',
        vitamin_b5: nutriments["vitamin-b5"] ? Math.round(nutriments["vitamin-b5"] * 100) : '',
        vitamin_b6: nutriments["vitamin-b6"] ? Math.round(nutriments["vitamin-b6"] * 100) : '',
        vitamin_b7: nutriments["vitamin-b7"] ? Math.round(nutriments["vitamin-b7"] * 100) : '',
        vitamin_b9: nutriments["vitamin-b9"] ? Math.round(nutriments["vitamin-b9"] * 100) : '',
        vitamin_b12: nutriments["vitamin-b12"] ? Math.round(nutriments["vitamin-b12"] * 100) : '',
        vitamin_c: nutriments["vitamin-c"] ? Math.round(nutriments["vitamin-c"] * 100) : '',
        vitamin_d: nutriments["vitamin-d"] ? Math.round(nutriments["vitamin-d"] * 100) : '',
        vitamin_e: nutriments["vitamin-e"] ? Math.round(nutriments["vitamin-e"] * 100) : '',
        vitamin_k: nutriments["vitamin-k"] ? Math.round(nutriments["vitamin-k"] * 100) : ''
      }

      console.log("Scanned product data from OpenFoodFacts:", scannedProductData)

      // Convert the scanned product into FoodItem format
      const serving_size_g = product.serving_quantity ? Number(product.serving_quantity) : 100;
      const perGram = {
        calories: (nutriments["energy-kcal_100g"] || 0) / 100,
        carbs: (nutriments["carbohydrates_100g"] || 0) / 100,
        fats: (nutriments["fat_100g"] || 0) / 100,
        protein: (nutriments["proteins_100g"] || 0) / 100,
        sugar: (nutriments["sugars_100g"] || 0) / 100,
        fiber: (nutriments["fiber_100g"] || 0) / 100,
        vitamin_a: (nutriments["vitamin-a_100g"] || 0) / 100,
        vitamin_c: (nutriments["vitamin-c_100g"] || 0) / 100,
        calcium: (nutriments["calcium_100g"] || 0) / 100,
        iron: (nutriments["iron_100g"] || 0) / 100,
        magnesium: (nutriments["magnesium_100g"] || 0) / 100,
        phosphorus: (nutriments["phosphorus_100g"] || 0) / 100,
        potassium: (nutriments["potassium_100g"] || 0) / 100,
        sodium: (nutriments["sodium_100g"] || 0) / 100,
      };
      const calculatedValues = {
        calories: nutriments["energy-kcal_100g"] || 0,
        carbs: nutriments["carbohydrates_100g"] || 0,
        fats: nutriments["fat_100g"] || 0,
        protein: nutriments["proteins_100g"] || 0,
        sugar: nutriments["sugars_100g"] || 0,
        fiber: nutriments["fiber_100g"] || 0,
        vitamin_a: nutriments["vitamin-a_100g"] || 0,
        vitamin_c: nutriments["vitamin-c_100g"] || 0,
        calcium: nutriments["calcium_100g"] || 0,
        iron: nutriments["iron_100g"] || 0,
        magnesium: nutriments["magnesium_100g"] || 0,
        phosphorus: nutriments["phosphorus_100g"] || 0,
        potassium: nutriments["potassium_100g"] || 0,
        sodium: nutriments["sodium_100g"] || 0,
      };

      const foodData: FoodItem = {
        food_ky: product.code,
        foodName: product.product_name || "Unknown Food",
        brands: product.brands || "Unknown Brand",
        unit: "g",
        serving_size: product.serving_size || "100",
        serving_size_g: serving_size_g,
        serving_size_imported: product.serving_size_imported,
        product_quantity_unit: product.product_quantity_unit || "g",
        serving_quantity: product.serving_quantity || serving_size_g,
        serving_quantity_unit: product.product_quantity_unit || "g",
        perGramValues: perGram,
        ...calculatedValues
      }

      setScannedFood(foodData)
      setShowMealEntry(true)
      setShowScanner(false)
      setScanError(null)
      
      // Update the URL without the barcode parameter to allow normal navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('barcode');
      window.history.replaceState({}, '', url.toString());
      
      // Navigate to flavor journal after successful scan and save
      router.push('/flavor-journal');
      
    } catch (error) {
      console.error("Error processing barcode:", error);
      console.error("Full error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        error
      }); // More detailed error logging
      setScanError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleScanError(error: Error) {
    console.error("Barcode scan error:", error)
    setScanError(error.message)
    setShowScanner(false)
  }

  const handleScanSuccess = () => {
    // Navigation will happen after successful scan and entry
    setShowScanner(false);
    router.push('/flavor-journal');
  };

  const handleCloseScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stopCamera();
    }
    setShowScanner(false);
  };

  const handleMealEntryClose = () => {
    setShowMealEntry(false)
    setScannedFood(null)
  }

  const handleMealEntryConfirm = async (foodData: any, saveToFoodInfo: boolean) => {
    try {
      setIsLoading(true);
      
      // Save the food entry
      const response = await fetch("/api/macro-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foodData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save food entry");
      }
      
      // If user chose to save to food_info table
      if (saveToFoodInfo) {
        await fetch("/api/save-to-food-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(foodData),
        });
      }
      
      // Handle success (show confirmation, etc.)
      setShowMealEntry(false);
      router.push('/flavor-journal');
      
    } catch (error) {
      console.error("Error saving food entry:", error);
      setScanError("Failed to save food entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
      {scannedFood && !isLoading && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Added to {meal}: {scannedFood.foodName} <br />
            Calories: {scannedFood.calories} cal, 
            Carbs: {scannedFood.carbs}g, 
            Fats: {scannedFood.fats}g, 
            Protein: {scannedFood.protein}g <br />
            <small>
              Full Nutriments: {JSON.stringify(scannedFood.perGramValues)}
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
        <BarcodeScanner
          ref={scannerRef}
          onDetected={handleBarcodeDetected}
          onError={handleScanError}
          onClose={handleCloseScanner}
          onSuccess={handleScanSuccess}
        />
      )}

      <AddFood meal={meal} />

      <MealEntry
        isOpen={showMealEntry}
        onClose={handleMealEntryClose}
        onConfirm={(foodData, saveToFoodInfo) => handleMealEntryConfirm(foodData, saveToFoodInfo)}
        selectedFood={scannedFood}
      />

      {/* Keep only the 'Add' button */}
      <div className="flex justify-end">
      </div>
    </div>
  )
}