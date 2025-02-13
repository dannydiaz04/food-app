"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useSession } from "next-auth/react"

export default function MacroCalculator() {
  const { data: session } = useSession()
  const [mealName, setMealName] = useState("breakfast")
  const [calories, setCalories] = useState(0)
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [protein, setProtein] = useState("")

  // Calculate calories whenever macros change
  useEffect(() => {
    const carbsCal = Number.parseFloat(carbs || "0") * 4
    const proteinCal = Number.parseFloat(protein || "0") * 4
    const fatsCal = Number.parseFloat(fats || "0") * 9

    const total = carbsCal + proteinCal + fatsCal
    setCalories(Math.round(total))
  }, [carbs, protein, fats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      console.error('User not authenticated')
      return
    }

    try {
      const response = await fetch('/api/food-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meal: mealName,
          foodName: "Custom Entry",
          quantity: 1,
          unit: "serving",
          calories,
          carbs: Number(carbs),
          fats: Number(fats),
          protein: Number(protein),
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add food entry')
      }

      // Reset form after successful submission
      setCarbs("")
      setFats("")
      setProtein("")
      setCalories(0)

      // Optionally redirect back to food diary
      window.location.href = "/"
    } catch (error) {
      console.error('Error submitting food entry:', error)
      // Handle error (show error message to user)
    }
  }

  // Handle input validation and changes
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Allow empty string or positive numbers
    if (value === "" || (/^\d*\.?\d*$/.test(value) && Number.parseFloat(value) >= 0)) {
      setter(value)
    }
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-green-400 hover:text-green-300 hover:bg-gray-800">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Food Diary
          </Button>
        </Link>

        <Card className="bg-gray-900 text-white border-green-500">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meal-name" className="text-green-400">
                  Meal Name
                </Label>
                <Select value={mealName} onValueChange={setMealName}>
                  <SelectTrigger id="meal-name" className="bg-gray-800 border-green-500 text-white">
                    <SelectValue placeholder="Select meal" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-green-500">
                    <SelectItem value="breakfast" className="text-white">
                      Breakfast
                    </SelectItem>
                    <SelectItem value="lunch" className="text-white">
                      Lunch
                    </SelectItem>
                    <SelectItem value="dinner" className="text-white">
                      Dinner
                    </SelectItem>
                    <SelectItem value="snack" className="text-white">
                      Snack
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories" className="text-green-400">
                  Calories (auto-calculated)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="calories"
                    type="number"
                    value={calories}
                    disabled
                    className="flex-1 bg-gray-700 text-white border-green-500"
                  />
                  <span className="text-sm text-green-400 min-w-[40px]">kcal</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-green-400">
                  Carbohydrates (4 kcal/g)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="carbs"
                    type="number"
                    value={carbs}
                    onChange={(e) => handleNumberInput(e.target.value, setCarbs)}
                    className="flex-1 bg-gray-800 text-white border-green-500"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-sm text-green-400 min-w-[40px]">g</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fats" className="text-green-400">
                  Fats (9 kcal/g)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fats"
                    type="number"
                    value={fats}
                    onChange={(e) => handleNumberInput(e.target.value, setFats)}
                    className="flex-1 bg-gray-800 text-white border-green-500"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-sm text-green-400 min-w-[40px]">g</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein" className="text-green-400">
                  Protein (4 kcal/g)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="protein"
                    type="number"
                    value={protein}
                    onChange={(e) => handleNumberInput(e.target.value, setProtein)}
                    className="flex-1 bg-gray-800 text-white border-green-500"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-sm text-green-400 min-w-[40px]">g</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
                    "transition-colors duration-200",
                  )}
                  onClick={() => {
                    setCarbs("")
                    setFats("")
                    setProtein("")
                    setCalories(0)
                  }}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "flex-1 bg-green-500 text-white hover:bg-green-600",
                    "transition-colors duration-200",
                    !carbs && !fats && !protein && "opacity-50 cursor-not-allowed",
                  )}
                  disabled={!carbs && !fats && !protein}
                >
                  ADD TO DIARY
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

