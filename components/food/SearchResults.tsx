import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { OpenFoodProduct, FoodItem } from "@/types/food"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SearchResultsProps {
  results: OpenFoodProduct[]
  expandedItemId: string | null
  selectedFood: FoodItem | null
  onResultClick: (product: OpenFoodProduct) => void
  onServingSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUnitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
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
      <ul className="space-y-2">
        {results.map((product) => (
          <li key={product.code} className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{product.product_name}</h3>
                    <p className="text-sm text-gray-500">{product.brands}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => onResultClick(product)}
                  >
                    {expandedItemId === product.code ? 'Close' : 'Details'}
                  </Button>
                </div>

                {expandedItemId === product.code && selectedFood && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="serving-size">Serving Size</Label>
                        <Input
                          id="serving-size"
                          type="number"
                          value={selectedFood.serving_size}
                          onChange={onServingSizeChange}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <select
                          id="unit"
                          value={selectedFood.unit}
                          onChange={onUnitChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="g">grams</option>
                          <option value="oz">ounces</option>
                          <option value="cup">cups</option>
                          <option value="tbsp">tablespoons</option>
                          <option value="tsp">teaspoons</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Calories: {selectedFood.calories}</div>
                      <div>Protein: {selectedFood.protein}g</div>
                      <div>Carbs: {selectedFood.carbs}g</div>
                      <div>Fat: {selectedFood.fats}g</div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                      <Button onClick={onConfirm}>
                        Add to Meal
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <div className="flex justify-center">
        {results.length > 0 && (
          searchLoading ? (
            <Button variant="outline" disabled className="opacity-50">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </Button>
          ) : (
            <Button onClick={onLoadMore} className="bg-green-500 text-white" variant="outline">
              Load More
            </Button>
          )
        )}
      </div>
    </div>
  )
}