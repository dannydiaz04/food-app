"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

interface FoodItem {
  food_ky: string
  foodName: string
  brands: string
  unit: string
  serving_size: string
  serving_size_g?: number
  perGramValues?: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sugar: number
    fiber: number
    vitamin_a: number
    vitamin_c: number
    calcium: number
    iron: number
    magnesium: number
    phosphorus: number
    potassium: number
    sodium: number
  }
  calories: number
  carbs: number
  fats: number
  protein: number
  sugar?: number
  fiber?: number
  vitamin_a?: number
  vitamin_c?: number
  calcium?: number
  iron?: number
  magnesium?: number
  phosphorus?: number
  potassium?: number
  sodium?: number
  zinc?: number
  vitamin_b1?: number
  vitamin_b2?: number
  vitamin_b3?: number
  vitamin_b5?: number
  vitamin_b6?: number
  vitamin_b7?: number
  vitamin_b9?: number
  vitamin_b12?: number
  vitamin_d?: number
  vitamin_e?: number
  vitamin_k?: number
  alcohol?: number
  caffeine?: number
}

interface OpenFoodProduct {
  abbreviated_product_name: string
  code: string
  product_name: string
  brands: string
  serving_quantity_unit: string
  serving_size?: string // Make serving_size optional
  nutriments: {
    [key: string]: number
  }
}

interface AddFoodProps {
  meal: string
}

// Update conversion functions with additional units
const convertToGrams = (amount: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case "g":
      return amount;
    case "oz":
      return amount * 28.3495; // 1 oz = 28.3495 grams
    case "tbsp":
      return amount * 14.7868; // 1 tbsp ≈ 14.7868 grams
    case "tsp":
      return amount * 4.92892; // 1 tsp ≈ 4.92892 grams
    case "cup":
      return amount * 236.588; // 1 cup = 236.588 grams
    default:
      return amount;
  }
};

const convertFromGrams = (grams: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case "g":
      return grams;
    case "oz":
      return grams / 28.3495;
    case "tbsp":
      return grams / 14.7868;
    case "tsp":
      return grams / 4.92892;
    case "cup":
      return grams / 236.588;
    default:
      return grams;
  }
};

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
  const router = useRouter()

  useEffect(() => {
    const fetchRecentFoods = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/recent-foods", {
          credentials: "include", // Include credentials for authentication
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
        setRecentFoods([]) // Reset foods on error
      } finally {
        setLoading(false)
      }
    }

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
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery,
        )}&search_simple=1&action=process&json=1`,
      )
      const data = await response.json()

      // Log the full JSON response from OpenFoodFacts so you can see all properties
      console.log("OpenFoodFacts full response:", data)

      // Optionally, log each individual product to see its properties
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

  const handleAddSearchResult = (product: OpenFoodProduct) => {
    if (expandedItemId === product.code) {
      setExpandedItemId(null)
      setSelectedFood(null)
    } else {
      const nutriments = product.nutriments || {}
      
      // Store the per-gram values (divide by 100 since API gives per 100g)
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
        sodium: (nutriments["sodium_100g"] || 0) / 100
      }

      // Default serving size to 100g if not provided
      const servingSizeG = 100

      const foodData: FoodItem = {
        food_ky: product.code,
        foodName: product.product_name || "Unknown Food",
        brands: product.brands || "Unknown Brand",
        unit: "g", // Default to grams
        serving_size: String(servingSizeG),
        serving_size_g: servingSizeG,
        perGramValues: perGram,
        // Calculate initial values for 100g serving
        calories: Math.round(perGram.calories * servingSizeG),
        carbs: Math.round(perGram.carbs * servingSizeG),
        fats: Math.round(perGram.fats * servingSizeG),
        protein: Math.round(perGram.protein * servingSizeG),
        sugar: Math.round(perGram.sugar * servingSizeG),
        fiber: Math.round(perGram.fiber * servingSizeG),
        vitamin_a: Math.round(perGram.vitamin_a * servingSizeG),
        vitamin_c: Math.round(perGram.vitamin_c * servingSizeG),
        calcium: Math.round(perGram.calcium * servingSizeG),
        iron: Math.round(perGram.iron * servingSizeG),
        magnesium: Math.round(perGram.magnesium * servingSizeG),
        phosphorus: Math.round(perGram.phosphorus * servingSizeG),
        potassium: Math.round(perGram.potassium * servingSizeG),
        sodium: Math.round(perGram.sodium * servingSizeG)
      }

      setSelectedFood(foodData)
      setExpandedItemId(product.code)
    }
  }

  // Add new function to handle unit/serving size changes
  const updateNutritionalValues = (food: FoodItem, newUnit: string, newServingSize: string) => {
    const newServingSizeNum = Number.parseFloat(newServingSize)
    if (!newServingSizeNum || newServingSizeNum <= 0) return food

    // If switching to grams, calculate per-gram values
    if (newUnit === "g") {
      const originalServingG = food.serving_size_g || Number.parseFloat(food.serving_size)
      const perGram = {
        calories: food.calories / originalServingG,
        carbs: food.carbs / originalServingG,
        fats: food.fats / originalServingG,
        protein: food.protein / originalServingG,
      }

      return {
        ...food,
        unit: newUnit,
        serving_size: newServingSize,
        calories: Math.round(perGram.calories * newServingSizeNum),
        carbs: Math.round(perGram.carbs * newServingSizeNum),
        fats: Math.round(perGram.fats * newServingSizeNum),
        protein: Math.round(perGram.protein * newServingSizeNum),
      }
    }

    // For other units, maintain the ratio with original serving size
    const ratio = newServingSizeNum / Number.parseFloat(food.serving_size)
    return {
      ...food,
      unit: newUnit,
      serving_size: newServingSize,
      calories: Math.round(food.calories * ratio),
      carbs: Math.round(food.carbs * ratio),
      fats: Math.round(food.fats * ratio),
      protein: Math.round(food.protein * ratio),
    }
  }

  // Add these to the expanded confirmation section
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedFood || !selectedFood.perGramValues) return

    const newUnit = e.target.value
    const currentServingSize = parseFloat(selectedFood.serving_size || "0")
    
    // Convert current serving size to grams, then to the new unit
    const currentGrams = convertToGrams(currentServingSize, selectedFood.unit)
    const newServingSize = convertFromGrams(currentGrams, newUnit)

    // Update the food with the new unit and converted serving size
    const updatedFood = {
      ...selectedFood,
      unit: newUnit,
      serving_size: String(Number(newServingSize.toFixed(2))), // Round to 2 decimal places
      serving_size_g: currentGrams, // Keep the gram weight the same
      // All nutritional values stay the same since the actual weight hasn't changed
    }

    setSelectedFood(updatedFood)
  }

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFood || !selectedFood.perGramValues) return

    const newServingSize = e.target.value
    const newServingSizeNum = parseFloat(newServingSize || "0")

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
        sodium: 0
      })
      return
    }

    // Convert the serving size to grams based on the current unit
    const servingSizeInGrams = convertToGrams(newServingSizeNum, selectedFood.unit)

    // Calculate new values based on per-gram values
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
      sodium: Math.round(perGramValues.sodium * servingSizeInGrams)
    }

    setSelectedFood(updatedFood)
  }

  // New: Function to confirm and save the selected food entry
  const confirmSave = async () => {
    if (!selectedFood) return
    try {
      setLoading(true)
      const response = await fetch("/api/macro-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedFood,
          meal,
          date: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to save food entry")
      }
      alert(`Food saved: ${selectedFood.foodName}`)
      setSelectedFood(null)
    } catch (err) {
      console.error("Error saving food entry:", err)
      alert("Failed to save food entry")
    } finally {
      setLoading(false)
    }
  }

  const toggleNutrition = () => {
    setShowNutrition((prev) => !prev)
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <h2 className="text-xl md:text-2xl font-bold">Add Food To {meal.charAt(0).toUpperCase() + meal.slice(1)}</h2>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Search the food database by name</h3>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </form>
            <Link href="#" onClick={handleQuickAddCalories} className="text-sm text-blue-500 hover:underline">
              Quick add calories
            </Link>
          </div>

          {searchLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}
          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Search Results</h4>
              <ul className="space-y-2">
                {searchResults.map((product) => (
                  <li key={product.code} className="border rounded-lg overflow-hidden">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{product.brands || "No listed brand"}</p>
                        <p className="">
                          {product.product_name || product.abbreviated_product_name || "No Product Name"}
                        </p>
                        <p className="text-sm">Calories: {product.nutriments["energy-kcal_100g"] || "N/A"}</p>
                      </div>
                      <Button
                        onClick={() => handleAddSearchResult(product)}
                        variant={expandedItemId === product.code ? "secondary" : "default"}
                      >
                        {expandedItemId === product.code ? "Close" : "Details"}
                      </Button>
                    </div>

                    {/* Confirmation section that expands/collapses */}
                    {expandedItemId === product.code && selectedFood && (
                      <div className="p-4 bg-muted/50 border-t">
                        <div className="space-y-4">
                          <h3 className="font-semibold">Confirm Food Entry</h3>
                          
                          {/* Serving size controls */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label>Serving Size</Label>
                              <Input
                                type="number"
                                value={selectedFood.serving_size}
                                onChange={handleServingSizeChange}
                              />
                            </div>
                            <div className="flex-1">
                              <Label>Unit</Label>
                              <select
                                className="w-full p-2 border rounded-md"
                                value={selectedFood.unit}
                                onChange={handleUnitChange}
                              >
                                <option value="g">grams (g)</option>
                                <option value="oz">ounces (oz)</option>
                                <option value="tbsp">tablespoons (tbsp)</option>
                                <option value="tsp">teaspoons (tsp)</option>
                                <option value="cup">cups</option>
                              </select>
                            </div>
                          </div>

                          {/* Rest of the confirmation section */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p>
                              <strong>Brand:</strong> {selectedFood.brands}
                            </p>
                            <p>
                              <strong>Calories:</strong> {selectedFood.calories}
                            </p>
                            <p>
                              <strong>Carbs:</strong> {selectedFood.carbs}g
                            </p>
                            <p>
                              <strong>Fats:</strong> {selectedFood.fats}g
                            </p>
                            <p>
                              <strong>Protein:</strong> {selectedFood.protein}g
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => {
                                confirmSave()
                                setExpandedItemId(null)
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setExpandedItemId(null)
                                setSelectedFood(null)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Foods Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">Or, add from your recent foods:</h3>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                <Button variant="outline" size="sm">
                  Recent
                </Button>
                <Button variant="outline" size="sm">
                  Frequent
                </Button>
                <Button variant="outline" size="sm">
                  My Foods
                </Button>
                <Button variant="outline" size="sm">
                  Meals
                </Button>
                <Button variant="outline" size="sm">
                  Recipes
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading recent foods...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Recent Foods Table - Only show if there are foods and no error */}
            {!loading && !error && recentFoods.length > 0 && (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Calories</TableHead>
                        <TableHead className="text-right">Carbs (g)</TableHead>
                        <TableHead className="text-right">Fats (g)</TableHead>
                        <TableHead className="text-right">Protein (g)</TableHead>
                        <TableHead>Serving</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentFoods.map((food) => (
                        <TableRow key={food.food_ky}>
                          <TableCell>
                            <input type="checkbox" className="rounded border-gray-300" />
                          </TableCell>
                          <TableCell>{food.foodName}</TableCell>
                          <TableCell className="text-right">{food.calories}</TableCell>
                          <TableCell className="text-right">{food.carbs}</TableCell>
                          <TableCell className="text-right">{food.fats}</TableCell>
                          <TableCell className="text-right">{food.protein}</TableCell>
                          <TableCell>
                            {food.serving_size} {food.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <Button variant="outline">Add Checked</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black-500 text-muted-foreground">Sort by:</span>
                    <select className="text-sm text-black-500 border rounded p-1">
                      <option>Default</option>
                      <option>Most Recent</option>
                      <option>Most Used</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* No Foods State */}
            {!loading && !error && recentFoods.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent foods found. Foods you add will appear here.
              </div>
            )}
          </div>

          <div>
            <Button onClick={toggleNutrition} className="mt-2">
              {showNutrition ? "Hide Nutrition" : "View Nutrition"}
            </Button>

            {showNutrition && selectedFood && (
              <div className="mt-4 p-4 border rounded">
                <h3 className="font-bold">Nutritional Information</h3>
                <p>Sugars: {selectedFood.sugar}g</p>
                <p>Fiber: {selectedFood.fiber}g</p>
                <p>Vitamin A: {selectedFood.vitamin_a} IU</p>
                <p>Vitamin C: {selectedFood.vitamin_c} mg</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}