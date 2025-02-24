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
                            value={selectedFood.serving_quantity ?? selectedFood.serving_size}
                            onChange={onServingSizeChange}
                            className="w-full"
                          />
                        </div>
                        <div className="w-full">
                          <Label htmlFor="unit">Unit</Label>
                          <Select 
                            onValueChange={onUnitChange} 
                            value={selectedFood.serving_quantity_unit ?? selectedFood.unit}
                            // disabled={selectedFood.serving_quantity_unit !== null}
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
                    <div className="p-2 bg-muted rounded">Calories: {selectedFood.calories}</div>
                    <div className="p-2 bg-muted rounded">Protein: {selectedFood.protein}g</div>
                    <div className="p-2 bg-muted rounded">Carbs: {selectedFood.carbs}g</div>
                    <div className="p-2 bg-muted rounded">Fat: {selectedFood.fats}g</div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={onConfirm} className="w-full sm:w-auto">
                      Add to Meal
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

