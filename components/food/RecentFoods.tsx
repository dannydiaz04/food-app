import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FoodItem } from "@/types/food"

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h4 className="text-lg font-semibold">Recent Foods</h4>
        <Button variant="outline" onClick={() => onSort("date")} className="w-full sm:w-auto">
          Sort by Date
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Food Name</TableHead>
                <TableHead className=" hidden sm:table-cell">Brand</TableHead>
                <TableHead className=" hidden md:table-cell">Serving Size</TableHead>
                <TableHead className="">Calories</TableHead>
                <TableHead className=" hidden lg:table-cell">Protein</TableHead>
                <TableHead className="">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foods.map((food) => (
                <TableRow key={food.food_ky}>
                  <TableCell className="">{food.foodName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{food.brands}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {food.serving_size} {food.unit}
                  </TableCell>
                  <TableCell className="">{food.calories}</TableCell>
                  <TableCell className="hidden lg:table-cell">{food.protein}g</TableCell>
                  <TableCell className="">
                    {/* <Button variant="ghost" onClick={() => onCheckFood(food.food_ky)}>
                      Add
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}