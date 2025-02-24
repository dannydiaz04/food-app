"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { SearchForm } from "./food/SearchForm"
import { SearchResults } from "./food/SearchResults"
import { RecentFoods } from "./food/RecentFoods"
import { MealEntry } from "@/components/meal-entry"
import type { FoodItem, OpenFoodProduct } from "@/types/food"
import { convertToGrams, convertFromGrams } from "@/utils/unit-conversion"

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
  const router = useRouter()

  useEffect(() => {
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
      const nutriments = product.nutriments || {}

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
      }

      const servingSizeG = 100
      const serving_quantity = product.product_quantity || null
      const serving_quantity_unit = product.product_quantity_unit || null

      const foodData: FoodItem = {
        food_ky: product.code,
        foodName: product.product_name || "Unknown Food",
        brands: product.brands || "Unknown Brand",
        unit: "g",
        serving_size: String(servingSizeG),
        serving_size_g: servingSizeG,
        serving_quantity: serving_quantity || 100,
        serving_quantity_unit: serving_quantity_unit || "g",
        perGramValues: perGram,
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
        sodium: Math.round(perGram.sodium * servingSizeG),
      }

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

  const handleMealEntryConfirm = async () => {
    if (!selectedFood) return
    try {
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
    } catch (err) {
      console.error("Error saving food entry:", err)
      throw err
    }
  }

  const toggleNutrition = () => {
    setShowNutrition((prev) => !prev)
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4">
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b px-4 py-4">
          <h2 className="text-xl md:text-2xl font-bold">Add Food To {meal.charAt(0).toUpperCase() + meal.slice(1)}</h2>
        </CardHeader>
        <CardContent>
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