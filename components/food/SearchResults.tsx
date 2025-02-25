import type React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OpenFoodProduct, FoodItem } from "@/types/food"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SearchResultsProps {
  results: OpenFoodProduct[]
  expandedItemId: string | null
  selectedFood: FoodItem | null
  onResultClick: (product: OpenFoodProduct) => void
  onServingSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUnitChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  onLoadMore: () => void
  searchLoading: boolean
}

// Define colors for macros
const macroColors = {
  carbs: "text-emerald-500", // Replace with actual color class
  protein: "text-amber-500", // Replace with actual color class
  fats: "text-purple-500", // Replace with actual color class
};

export function SearchResults({
  results,
  expandedItemId,
  selectedFood,
  onResultClick,
  onServingSizeChange,
  onUnitChange,
  onConfirm,
  onCancel,
  onLoadMore,
  searchLoading,
}: SearchResultsProps) {
  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFood) return
    const newSize = e.target.value
    // Only call the parent handler if we have a valid number
    if (!isNaN(parseFloat(newSize))) {
      onServingSizeChange(e)
    }
  }

  const handleUnitChange = (value: string) => {
    onUnitChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)
  }

  return (
    <div className="space-y-4 w-full">
      <h4 className="text-lg font-semibold">Search Results</h4>
      <div className="space-y-2">
        {results.map((product) => (
          <Card key={product.code} className="w-full">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{product.product_name}</h3>
                  <p className="text-sm text-muted-foreground">{product.brands}</p>
                </div>
                <Button
                  variant={expandedItemId === product.code ? "ghost" : "default"}
                  onClick={() => onResultClick(product)}
                  className="shrink-0 w-full sm:w-auto"
                >
                  {expandedItemId === product.code ? "Close" : "Details"}
                </Button>
              </div>

              {expandedItemId === product.code && selectedFood && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="w-full">
                      <Label htmlFor="serving-size">Serving Size</Label>
                      <Input
                        id="serving-size"
                        type="number"
                        value={selectedFood.serving_size}
                        onChange={handleServingSizeChange}
                        className="w-full"
                        min="0"
                        step="any"
                        readOnly
                      />
                    </div>
                    <div className="w-full">
                      <Label htmlFor="unit">Unit</Label>
                      <Select 
                        onValueChange={handleUnitChange} 
                        value={selectedFood.unit}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">grams</SelectItem>
                          <SelectItem value="oz">ounces</SelectItem>
                          <SelectItem value="cup">cups</SelectItem>
                          <SelectItem value="tbsp">tablespoons</SelectItem>
                          <SelectItem value="tsp">teaspoons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>Calories: {selectedFood.calories}</div>
                    <div>Protein: <span className={macroColors.protein}>{selectedFood.protein}g</span></div>
                    <div>Carbs: <span className={macroColors.carbs}>{selectedFood.carbs}g</span></div>
                    <div>Fat: <span className={macroColors.fats}>{selectedFood.fats}g</span></div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button onClick={onConfirm} className="w-full sm:w-auto">
                      Edit & Add
                    </Button>
                    <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                      Cancel
                    </Button>

                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {results.length > 0 && (
        <div className="py-4 flex justify-center">
          <Button onClick={onLoadMore} variant="outline" disabled={searchLoading} className="w-full sm:w-auto">
            {searchLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

