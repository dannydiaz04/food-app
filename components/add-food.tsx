"use client"

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
  calories: number
  carbs: number
  fats: number
  protein: number
}

interface OpenFoodProduct {
  code: string;
  product_name: string;
  brands: string;
  serving_quantity_unit: string;
  serving_size: string;
  nutriments: {
    [key: string]: number;
  }
}

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
  
  const router = useRouter()

  useEffect(() => {
    const fetchRecentFoods = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch("/api/recent-foods", {
          credentials: 'include', // Include credentials for authentication
          headers: {
            'Content-Type': 'application/json',
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
    if (!searchQuery.trim()) return;

    setSearchLoading(true)
    setSearchError(null)
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery
        )}&search_simple=1&action=process&json=1`
      )
      const data = await response.json()
      
      // Log the full JSON response from OpenFoodFacts so you can see all properties
      console.log("OpenFoodFacts full response:", data);

      // Optionally, log each individual product to see its properties
      if (data && data.products) {
        data.products.forEach((product: any, index: number) => {
          console.log(`Product ${index} details:`, product);
        });
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
    const nutriments = product.nutriments || {}
    const servingSizeG = parseFloat(product.serving_size || '0') || 100 // Default to 100g if not provided
    
    // Calculate per 100g values first
    const per100g = {
      calories: Math.round(nutriments["energy-kcal_100g"] || 0),
      carbs: Math.round(nutriments["carbohydrates_100g"] || 0),
      fats: Math.round(nutriments["fat_100g"] || 0),
      protein: Math.round(nutriments["proteins_100g"] || 0),
    }

    // Calculate per serving values
    const perServing = {
      calories: Math.round((per100g.calories * servingSizeG) / 100),
      carbs: Math.round((per100g.carbs * servingSizeG) / 100),
      fats: Math.round((per100g.fats * servingSizeG) / 100),
      protein: Math.round((per100g.protein * servingSizeG) / 100),
    }

    const foodData: FoodItem = {
      food_ky: product.code,
      foodName: product.product_name || "Unknown Food",
      brands: product.brands || "Unknown Brand",
      unit: product.serving_quantity_unit || "g",
      serving_size: product.serving_size || "100",
      serving_size_g: servingSizeG,
      calories: perServing.calories,
      carbs: perServing.carbs,
      fats: perServing.fats,
      protein: perServing.protein,
    }

    setSelectedFood(foodData)
    setExpandedItemId(product.code)
  }

  // Add new function to handle unit/serving size changes
  const updateNutritionalValues = (
    food: FoodItem,
    newUnit: string,
    newServingSize: string
  ) => {
    const newServingSizeNum = parseFloat(newServingSize)
    if (!newServingSizeNum || newServingSizeNum <= 0) return food

    // If switching to grams, calculate per-gram values
    if (newUnit === 'g') {
      const originalServingG = food.serving_size_g || parseFloat(food.serving_size)
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
    const ratio = newServingSizeNum / parseFloat(food.serving_size)
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
    if (!selectedFood) return
    const newFood = updateNutritionalValues(selectedFood, e.target.value, selectedFood.serving_size)
    setSelectedFood(newFood)
  }

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFood) return;
    
    const value = e.target.value;
    // Allow empty string or valid numbers
    setSelectedFood({
      ...selectedFood,
      serving_size: value
    });
  }

  // New: Function to confirm and save the selected food entry
  const confirmSave = async () => {
    if (!selectedFood) return;
    try {
      setLoading(true)
      const response = await fetch('/api/macro-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedFood,
          meal,
          date: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to save food entry')
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

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <h2 className="text-xl md:text-2xl font-bold">
          Add Food To {meal.charAt(0).toUpperCase() + meal.slice(1)}
        </h2>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Search the food database by name
            </h3>
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
            <Link 
              href="#" 
              onClick={handleQuickAddCalories}
              className="text-sm text-blue-500 hover:underline"
            >
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
                  <li
                    key={product.code}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{product.product_name || "Unnamed Product"}</p>
                        <p className="text-sm">
                          Calories: {product.nutriments["energy-kcal_100g"] || "N/A"}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleAddSearchResult(product)}
                        variant={expandedItemId === product.code ? "secondary" : "default"}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Confirmation section that expands/collapses */}
                    {expandedItemId === product.code && selectedFood && (
                      <div className="p-4 bg-muted/50 border-t">
                        <div className="space-y-2">
                          <h3 className="font-semibold">Confirm Food Entry</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Serving Size</Label>
                              <Input
                                type="number"
                                value={selectedFood.serving_size}
                                onChange={handleServingSizeChange}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit</Label>
                              <select
                                className="w-full p-2 border rounded-md"
                                value={selectedFood.unit}
                                onChange={handleUnitChange}
                              >
                                <option value="g">grams (g)</option>
                                <option value="serving">serving</option>
                                <option value="oz">ounces (oz)</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p><strong>Brand:</strong> {selectedFood.brands}</p>
                              <p><strong>Calories:</strong> {selectedFood.calories}</p>
                              <p><strong>Carbs:</strong> {selectedFood.carbs}g</p>
                              <p><strong>Fats:</strong> {selectedFood.fats}g</p>
                              <p><strong>Protein:</strong> {selectedFood.protein}g</p>
                            </div>
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
              <h3 className="text-lg font-semibold">
                Or, add from your recent foods:
              </h3>
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
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading recent foods...
                </span>
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
                          <TableCell>{food.serving_size} {food.unit}</TableCell>
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
        </div>
      </CardContent>
    </Card>
  )
} 