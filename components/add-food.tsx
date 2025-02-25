"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { SearchForm } from "./food/SearchForm"
import { SearchResults } from "./food/SearchResults"
import { RecentFoods } from "./food/RecentFoods"
import { MealEntry } from "@/components/meal-entry"
import { LabelScanner } from "@/components/label-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calculator, Camera, Barcode } from "lucide-react"
import type { FoodItem, OpenFoodProduct } from "@/types/food"
import { convertToGrams, convertFromGrams } from "@/utils/unit-conversion"
import { MacroCalculator } from "./macro-calculator"
import BarcodeScanner from "@/components/barcode-scanner"

interface AddFoodProps {
  meal: string
}

export function AddFood({ meal }: AddFoodProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<OpenFoodProduct[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [showNutrition, setShowNutrition] = useState(false)
  const [page, setPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const [showMealEntry, setShowMealEntry] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const barcodeScannerRef = useRef<{ stopCamera?: () => void }>({})
  const router = useRouter()

  const fetchRecentFoods = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/recent-foods", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Fetched food data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recent foods")
      }

      setRecentFoods(data)
    } catch (err) {
      console.error("Error fetching recent foods:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setRecentFoods([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentFoods()
  }, [])

  const handleQuickAddCalories = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(`/add-food/macro-calculator?meal=${meal.toLowerCase()}`)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    setSearchError(null)
    setHasSearched(true)
    setPage(1)

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery,
        )}&search_simple=1&action=process&json=1&page=${page}`,
      )
      const data = await response.json()

      console.log("OpenFoodFacts full response:", data)

      if (data && data.products) {
        data.products.forEach((product: any, index: number) => {
          console.log(`Product ${index} details:`, product)
        })
        setSearchResults(data.products)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error("Error searching for foods:", err)
      setSearchError(err instanceof Error ? err.message : "Unexpected error occurred while searching")
    } finally {
      setSearchLoading(false)
    }
  }

  const loadMore = async () => {
    setSearchLoading(true)
    try {
      const nextPage = page + 1
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery,
        )}&search_simple=1&action=process&json=1&page=${nextPage}`,
      )
      const data = await response.json()

      if (data && data.products) {
        setSearchResults((prev) => [...prev, ...data.products])
        setPage(nextPage)
      }
    } catch (err) {
      console.error("Error loading more results:", err)
      setSearchError(err instanceof Error ? err.message : "Unexpected error occurred while loading more")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddSearchResult = (product: OpenFoodProduct) => {
    if (expandedItemId === product.code) {
      setExpandedItemId(null)
      setSelectedFood(null)
    } else {
      const nutriments = product.nutriments_estimated || {}

      // Calculate per gram values by dividing by 100 (since values are per 100g)
      const perGram = {
        calories: (nutriments["energy_100g"] || 0) / 100,
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
      }

      // Extract serving size in grams from the imported serving size
      let serving_size_g = 100 // default to 100g
      if (product.serving_size_imported) {
        // Try to extract the gram value from strings like "1/2 cup (48 g)"
        const match = String(product.serving_size_imported).match(/\((\d+)\s*g\)/)
        if (match) {
          serving_size_g = parseInt(match[1])
        }
      }

      console.log('Raw nutriments from API:', nutriments)
      console.log(`Serving size in grams: ${serving_size_g}g`)
      console.log('Per gram values:', perGram)

      // Calculate values based on the serving size
      const calculatedValues = {
        calories: Math.round(perGram.calories * serving_size_g),
        carbs: Math.round(perGram.carbs * serving_size_g * 10) / 10,
        fats: Math.round(perGram.fats * serving_size_g * 10) / 10,
        protein: Math.round(perGram.protein * serving_size_g * 10) / 10,
        sugar: Math.round(perGram.sugar * serving_size_g * 10) / 10,
        fiber: Math.round(perGram.fiber * serving_size_g * 10) / 10,
        vitamin_a: Math.round(perGram.vitamin_a * serving_size_g * 10) / 10,
        vitamin_c: Math.round(perGram.vitamin_c * serving_size_g * 10) / 10,
        calcium: Math.round(perGram.calcium * serving_size_g * 10) / 10,
        iron: Math.round(perGram.iron * serving_size_g * 10) / 10,
        magnesium: Math.round(perGram.magnesium * serving_size_g * 10) / 10,
        phosphorus: Math.round(perGram.phosphorus * serving_size_g * 10) / 10,
        potassium: Math.round(perGram.potassium * serving_size_g * 10) / 10,
        sodium: Math.round(perGram.sodium * serving_size_g * 10) / 10,
      }

      console.log('Calculated values for current serving size:', calculatedValues)

      const foodData: FoodItem = {
        food_ky: product.code,
        foodName: product.product_name || "Unknown Food",
        brands: product.brands || "Unknown Brand",
        unit: "g", // Start with grams
        serving_size: serving_size_g,
        serving_size_g: serving_size_g,
        serving_size_imported: product.serving_size_imported,
        product_quantity_unit: product.product_quantity_unit || "g",
        serving_quantity: product.serving_quantity || serving_size_g,
        serving_quantity_unit: product.product_quantity_unit || "g",
        perGramValues: perGram,
        ...calculatedValues // Spread the calculated values
      }

      console.log('Final food data:', foodData)

      setSelectedFood(foodData)
      setExpandedItemId(product.code)
    }
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedFood || !selectedFood.perGramValues) return

    const newUnit = e.target.value
    const currentServingSize = Number.parseFloat(selectedFood.serving_size || "0")

    const currentGrams = convertToGrams(currentServingSize, selectedFood.unit)
    const newServingSize = convertFromGrams(currentGrams, newUnit)

    const updatedFood = {
      ...selectedFood,
      unit: newUnit,
      serving_size: String(Number(newServingSize.toFixed(2))),
      serving_size_g: currentGrams,
    }

    setSelectedFood(updatedFood)
  }

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFood || !selectedFood.perGramValues) return

    const newServingSize = e.target.value
    const newServingSizeNum = Number.parseFloat(newServingSize || "0")

    if (isNaN(newServingSizeNum) || newServingSizeNum <= 0) {
      setSelectedFood({
        ...selectedFood,
        serving_size: "0",
        serving_size_g: 0,
        calories: 0,
        carbs: 0,
        fats: 0,
        protein: 0,
        sugar: 0,
        fiber: 0,
        vitamin_a: 0,
        vitamin_c: 0,
        calcium: 0,
        iron: 0,
        magnesium: 0,
        phosphorus: 0,
        potassium: 0,
        sodium: 0,
      })
      return
    }

    const servingSizeInGrams = convertToGrams(newServingSizeNum, selectedFood.unit)

    const { perGramValues } = selectedFood
    const updatedFood = {
      ...selectedFood,
      serving_size: String(newServingSizeNum),
      serving_size_g: servingSizeInGrams,
      calories: Math.round(perGramValues.calories * servingSizeInGrams),
      carbs: Math.round(perGramValues.carbs * servingSizeInGrams),
      fats: Math.round(perGramValues.fats * servingSizeInGrams),
      protein: Math.round(perGramValues.protein * servingSizeInGrams),
      sugar: Math.round(perGramValues.sugar * servingSizeInGrams),
      fiber: Math.round(perGramValues.fiber * servingSizeInGrams),
      vitamin_a: Math.round(perGramValues.vitamin_a * servingSizeInGrams),
      vitamin_c: Math.round(perGramValues.vitamin_c * servingSizeInGrams),
      calcium: Math.round(perGramValues.calcium * servingSizeInGrams),
      iron: Math.round(perGramValues.iron * servingSizeInGrams),
      magnesium: Math.round(perGramValues.magnesium * servingSizeInGrams),
      phosphorus: Math.round(perGramValues.phosphorus * servingSizeInGrams),
      potassium: Math.round(perGramValues.potassium * servingSizeInGrams),
      sodium: Math.round(perGramValues.sodium * servingSizeInGrams),
    }

    setSelectedFood(updatedFood)
  }

  const handleConfirm = async () => {
    if (!selectedFood) return
    setShowMealEntry(true)
  }

  const handleMealEntryClose = () => {
    setShowMealEntry(false)
    setSelectedFood(null)
    setExpandedItemId(null)
  }

  const handleMealEntryConfirm = async (updatedFood: FoodItem) => {
    try {
      const response = await fetch("/api/macro-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedFood,
          meal,
          date: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to save food entry")
      }
      
      // Reset the search state after successful save
      setSelectedFood(null)
      setExpandedItemId(null)
      setShowMealEntry(false)
      
      // Clear the search query and results (optional)
      setSearchQuery("")
      setSearchResults([])
      setHasSearched(false)
      
      // Refresh recent foods list
      fetchRecentFoods()
    } catch (err) {
      console.error("Error saving food entry:", err)
      throw err
    }
  }

  const toggleNutrition = () => {
    setShowNutrition((prev) => !prev)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    // If navigating away from barcode tab, stop the camera
    if (activeTab === "barcode" && value !== "barcode") {
      if (barcodeScannerRef.current?.stopCamera) {
        barcodeScannerRef.current.stopCamera()
      }
    }
    
    setActiveTab(value)
    
    // Handle navigation to calculator
    if (value === "calculator") {
      router.push(`/add-food/macro-calculator?meal=${meal.toLowerCase()}`)
    }
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4">
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b px-4 py-4">
          <h2 className="text-xl md:text-2xl font-bold">Add Food To {meal.charAt(0).toUpperCase() + meal.slice(1)}</h2>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="search" 
            className="space-y-4"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Label</span>
              </TabsTrigger>
              <TabsTrigger value="barcode" className="flex items-center gap-2">
                <Barcode className="w-4 h-4" />
                <span className="hidden sm:inline">Barcode</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Calculator</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-4">
              <MacroCalculator meal={meal} />
            </TabsContent>
            <TabsContent value="search" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="md:sticky top-0 bg-background pt-4 pb-2 -mx-4 px-4 z-10">
                    <SearchForm
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onSearch={handleSearch}
                      onQuickAdd={handleQuickAddCalories}
                      isLoading={searchLoading}
                    />
                  </div>
                  <SearchResults
                    results={searchResults}
                    expandedItemId={expandedItemId}
                    selectedFood={selectedFood}
                    onResultClick={handleAddSearchResult}
                    onServingSizeChange={handleServingSizeChange}
                    onUnitChange={handleUnitChange}
                    onConfirm={handleConfirm}
                    onCancel={() => {
                      setExpandedItemId(null)
                      setSelectedFood(null)
                    }}
                    onLoadMore={loadMore}
                    searchLoading={searchLoading}
                  />
                </div>
                <div className="space-y-6">
                  <RecentFoods
                    loading={loading}
                    error={error}
                    foods={recentFoods}
                    onSort={(sortBy) => {
                      // Add your sort logic here
                    }}
                    onCheckFood={(foodKy) => {
                      // Add your check food logic here
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scan" className="space-y-4">
              <LabelScanner />
            </TabsContent>

            <TabsContent value="barcode" className="space-y-4">
              {activeTab === "barcode" && (
                <BarcodeScanner 
                  ref={barcodeScannerRef}
                  onDetected={(barcode) => {
                    // Redirect to the current meal with the barcode parameter
                    router.push(`/add-food/${meal}?barcode=${barcode}`)
                  }}
                  onError={(error) => {
                    console.error("Barcode scanner error:", error)
                    setError("Failed to scan barcode: " + error.message)
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4">
              {/* Add your calculator content here */}
              <div className="text-center text-muted-foreground">
                Quick add calories and macros manually
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <MealEntry
        isOpen={showMealEntry}
        onClose={handleMealEntryClose}
        onConfirm={handleMealEntryConfirm}
        selectedFood={selectedFood}
      />
    </div>
  )
}