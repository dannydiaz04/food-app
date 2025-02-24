import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FoodItem } from "@/types/food"

interface RecentFoodsProps {
  loading: boolean
  error: string | null
  foods: FoodItem[]
  onSort: (sortBy: string) => void
  onCheckFood: (foodKy: string) => void
}

export function RecentFoods({ loading, error, foods, onSort, onCheckFood }: RecentFoodsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Recent Foods</h4>
        <Button variant="outline" onClick={() => onSort('date')}>
          Sort by Date
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Serving Size</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Protein</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {foods.map((food) => (
              <TableRow key={food.food_ky}>
                <TableCell>{food.foodName}</TableCell>
                <TableCell>{food.brands}</TableCell>
                <TableCell>{food.serving_size} {food.unit}</TableCell>
                <TableCell>{food.calories}</TableCell>
                <TableCell>{food.protein}g</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    onClick={() => onCheckFood(food.food_ky)}
                  >
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}