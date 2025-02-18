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

interface FoodItem {
  id: string
  foodName: string
  quantity: number
  unit: string
}

interface AddFoodProps {
  meal: string
}

export function AddFood({ meal }: AddFoodProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRecentFoods = async () => {
      try {
        setError(null)
        const response = await fetch("/api/recent-foods")
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch recent foods")
        }
        
        const data = await response.json()
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

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <h2 className="text-xl font-bold">Add Food To {meal.charAt(0).toUpperCase() + meal.slice(1)}</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Search our food database by name
            </h3>
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </div>
            <Link 
              href="#" 
              onClick={handleQuickAddCalories}
              className="text-sm text-blue-500 hover:underline"
            >
              Quick add calories
            </Link>
          </div>

          {/* Recent Foods Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Or, add from your recent foods:</h3>
              <div className="flex gap-2">
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
                <AlertDescription>
                  {error}
                </AlertDescription>
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
                        <TableHead>Serving</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentFoods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell>
                            <input type="checkbox" className="rounded border-gray-300" />
                          </TableCell>
                          <TableCell>{food.foodName}</TableCell>
                          <TableCell>{food.quantity} {food.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline">Add Checked</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select className="text-sm border rounded p-1">
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