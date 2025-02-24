"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import React from "react"

interface FoodProduct {
  code: string
  product_name: string
  brands: string
  serving_size: string
  serving_size_unit: string
  nutriments: {
    "energy-kcal_100g"?: number
    carbohydrates_100g?: number
    fat_100g?: number
    proteins_100g?: number
    sodium_100g?: number
    sugars_100g?: number
    fiber_100g?: number
    vitamin_a?: number
    vitamin_c?: number
    calcium?: number
    iron?: number
    magnesium?: number
    phosphorus?: number
    potassium?: number
    sodium?: number
  }
}

export function DatabaseSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FoodProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/database-search?query=${encodeURIComponent(searchQuery)}&page=${page}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search database")
      }

      setSearchResults(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreResults = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/database-search?query=${encodeURIComponent(searchQuery)}&page=${page + 1}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load more results")
      }

      setSearchResults((prevResults) => [...prevResults, ...(data.products || [])])
      setPage((prevPage) => prevPage + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFood = (product: FoodProduct) => {
    // Navigate to the macro calculator with pre-filled data
    const queryParams = new URLSearchParams({
      foodName: product.product_name || "Unknown Food",
      calories: String(Math.round(product.nutriments["energy-kcal_100g"] || 0)),
      carbs: String(Math.round(product.nutriments.carbohydrates_100g || 0)),
      fats: String(Math.round(product.nutriments.fat_100g || 0)),
      protein: String(Math.round(product.nutriments.proteins_100g || 0)),
      sodium: String(Math.round((product.nutriments.sodium_100g || 0) * 1000)), // Convert to mg
      sugar: String(Math.round(product.nutriments.sugars_100g || 0)),
      fiber: String(Math.round(product.nutriments.fiber_100g || 0)),
      vitamin_a: String(Math.round(product.nutriments.vitamin_a || 0)),
      vitamin_c: String(Math.round(product.nutriments.vitamin_c || 0)),
      calcium: String(Math.round(product.nutriments.calcium || 0)),
      iron: String(Math.round(product.nutriments.iron || 0)),
      magnesium: String(Math.round(product.nutriments.magnesium || 0)),
      phosphorus: String(Math.round(product.nutriments.phosphorus || 0)),
      potassium: String(Math.round(product.nutriments.potassium || 0)),
    })

    router.push(`/add-food/macro-calculator?${queryParams.toString()}`)
  }

  const toggleNutrition = (productCode: string) => {
    setSelectedFoodId(currentId => currentId === productCode ? null : productCode)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Food Database Search</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for foods..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Calories</TableHead>
                <TableHead className="text-right">Carbs</TableHead>
                <TableHead className="text-right">Fat</TableHead>
                <TableHead className="text-right">Protein</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((product) => (
                <React.Fragment key={product.code}>
                  <TableRow key={product.code}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>{product.brands}</TableCell>
                    <TableCell className="text-right">
                      {Math.round(product.nutriments["energy-kcal_100g"] || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(product.nutriments.carbohydrates_100g || 0)}g
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(product.nutriments.fat_100g || 0)}g
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(product.nutriments.proteins_100g || 0)}g
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddFood(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleNutrition(product.code)}
                      >
                        {selectedFoodId === product.code ? "Hide Nutrition" : "View Nutrition"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {selectedFoodId === product.code && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="p-4 bg-muted/50 rounded-md">
                          <h3 className="font-bold mb-2">Additional Nutritional Information</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>Sugars: {Math.round(product.nutriments.sugars_100g || 0)}g</div>
                            <div>Fiber: {Math.round(product.nutriments.fiber_100g || 0)}g</div>
                            <div>Sodium: {Math.round((product.nutriments.sodium_100g || 0) * 1000)}mg</div>
                            <div>Calcium: {Math.round(product.nutriments.calcium || 0)}mg</div>
                            <div>Iron: {Math.round(product.nutriments.iron || 0)}mg</div>
                            <div>Vitamin A: {Math.round(product.nutriments.vitamin_a || 0)}IU</div>
                            <div>Vitamin C: {Math.round(product.nutriments.vitamin_c || 0)}mg</div>
                            <div>Potassium: {Math.round(product.nutriments.potassium || 0)}mg</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {searchResults.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center mt-4">
          <Button onClick={loadMoreResults} disabled={isLoading || !hasSearched}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load More"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}