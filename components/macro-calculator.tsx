"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MacroCalculatorProps {
  meal: string
  isOpen?: boolean
  onClose?: () => void
}

export function MacroCalculator({ meal, isOpen = true, onClose }: MacroCalculatorProps) {
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
    try {
      const response = await fetch('/api/food-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meal,
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

      // Reset form and close
      setCarbs("")
      setFats("")
      setProtein("")
      setCalories(0)
      onClose()
    } catch (error) {
      console.error('Error submitting food entry:', error)
    }
  }

  if (onClose && !isOpen) return null

  return (
    <div 
      className={cn(
        onClose ? "fixed inset-0 bg-black/50 flex items-center justify-center z-50" : "w-full"
      )}
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md mx-4 bg-gray-900 text-white border-green-500"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">
            Macro Calculator - {meal}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-green-400">
                Calories (auto-calculated)
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                disabled
                className="bg-gray-700 text-white border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-green-400">
                Carbohydrates (4 kcal/g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="bg-gray-800 text-white border-green-500"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fats" className="text-green-400">
                Fats (9 kcal/g)
              </Label>
              <Input
                id="fats"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="bg-gray-800 text-white border-green-500"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein" className="text-green-400">
                Protein (4 kcal/g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="bg-gray-800 text-white border-green-500"
                min="0"
                step="0.1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={cn(
                  "flex-1 bg-green-500 text-white hover:bg-green-600",
                  !carbs && !fats && !protein && "opacity-50 cursor-not-allowed"
                )}
                disabled={!carbs && !fats && !protein}
              >
                Add to {meal}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 