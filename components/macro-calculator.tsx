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
  isPage?: boolean
}

export function MacroCalculator({ meal, isOpen = true, onClose, isPage = false }: MacroCalculatorProps) {
  const [foodName, setFoodName] = useState("Custom Entry")
  const [calories, setCalories] = useState<number | ''>(0)
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [protein, setProtein] = useState("")

  // New: Date state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // format: YYYY-MM-DD
  })

  // Toggle to allow manual editing of calories.
  // When false, calories will auto-calculate.
  const [overrideCalories, setOverrideCalories] = useState(false)

  // Toggle for showing micronutrient fields
  const [showMicronutrients, setShowMicronutrients] = useState(false)

  // Additional micronutrient state variables
  const [micronutrients, setMicronutrients] = useState({
    fiber: "",
    sodium: "",
    sugar: "",
    zinc: "",
    vitaminA: "",
    vitaminB: "",
    vitaminC: "",
    vitaminD: "",
    vitaminE: "",
    vitaminK: "",
    vitaminB1: "",
    vitaminB2: "",
    vitaminB3: "",
    vitaminB5: "",
    vitaminB6: "",
    vitaminB7: "",
    vitaminB9: "",
    vitaminB12: "",
    calcium: "",
    phosphorus: "",
    magnesium: "",
    potassium: "",
    chloride: "",
    sulfur: "",
    iron: "",
    manganese: "",
    copper: "",
    iodine: "",
    cobalt: "",
    fluoride: "",
    selenium: "",
    molybdenum: "",
    chromium: ""
  })

  // Update the override calories handler to clear the field when switching to manual
  const handleOverrideCalories = () => {
    setOverrideCalories((prev) => {
      if (!prev) {
        setCalories('') // Clear the field when switching to manual
      }
      return !prev
    })
  }

  // Calculate calories from macros when not overidden
  useEffect(() => {
    if (!overrideCalories) {
      const carbsCal = Number.parseFloat(carbs || "0") * 4
      const proteinCal = Number.parseFloat(protein || "0") * 4
      const fatsCal = Number.parseFloat(fats || "0") * 9

      const total = carbsCal + proteinCal + fatsCal
      setCalories(Math.round(total))
    }
  }, [carbs, protein, fats, overrideCalories])

  const handleMicronutrientChange = (nutrient: string, value: string) => {
    setMicronutrients((prev) => ({
      ...prev,
      [nutrient]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const micronutrientsData = Object.entries(micronutrients).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value ? Number(value) : null
        }),
        {}
      )

      // Convert the selected date to ISO format
      const entryDate = new Date(selectedDate).toISOString()

      const response = await fetch("/api/macro-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          meal,
          foodName: foodName || "Custom Entry",
          quantity: 1,
          unit: "serving",
          calories,
          // When the macros are optional during manual calorie entry,
          // empty strings will convert to 0.
          carbs: Number(carbs || 0),
          fats: Number(fats || 0),
          protein: Number(protein || 0),
          ...micronutrientsData,
          date: entryDate
        })
      })

      if (!response.ok) {
        throw new Error("Failed to add food entry")
      }

      // Reset form and close modal
      setFoodName("Custom Entry")
      setCarbs("")
      setFats("")
      setProtein("")
      setCalories(0)
      setOverrideCalories(false)
      setMicronutrients(
        Object.fromEntries(Object.keys(micronutrients).map((key) => [key, ""]))
      )
      onClose?.()
    } catch (error) {
      console.error("Error submitting food entry:", error)
    }
  }

  if (!isOpen && onClose) return null

  const content = (
    <Card className="w-full max-w-md mx-4 bg-gray-900 text-white border-green-500 max-h-[90vh] flex flex-col">
      <CardContent className="pt-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-green-400">
          Macro Calculator – {meal}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DATE INPUT */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-green-400">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 text-white border-green-500"
            />
          </div>

          {/* FOOD NAME INPUT */}
          <div className="space-y-2">
            <Label htmlFor="foodName" className="text-green-400">
              Food Name
            </Label>
            <Input
              id="foodName"
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Custom Entry"
              className="bg-gray-800 text-white border-green-500"
            />
          </div>

          {/* CALORIES INPUT */}
          <div className="space-y-2">
            <Label htmlFor="calories" className="text-green-400">
              Calories {overrideCalories ? "(manual)" : "(auto-calculated)"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) =>
                  setCalories(e.target.value ? Number(e.target.value) : '')
                }
                disabled={!overrideCalories}
                className="bg-gray-700 text-white border-green-500"
                placeholder="Enter calories"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={handleOverrideCalories}
                className="text-green-400"
              >
                {overrideCalories ? "Auto Calculate" : "Add Calories Manually"}
              </Button>
            </div>
          </div>

          {/* CARBOHYDRATES */}
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

          {/* FATS */}
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

          {/* PROTEIN */}
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

          {/* TOGGLE MICRONUTRIENTS BUTTON */}
          <Button
            type="button"
            variant="ghost"
            className="mt-2 text-green-400"
            onClick={() => setShowMicronutrients((prev) => !prev)}
          >
            {showMicronutrients
              ? "Hide Vitamins & Minerals"
              : "Add Vitamins & Minerals"}
          </Button>

          {/* MICRONUTRIENT FIELDS */}
          {showMicronutrients && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(micronutrients).map(([nutrient, value]) => (
                  <div key={nutrient} className="space-y-2">
                    <Label htmlFor={nutrient} className="text-green-400">
                      {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}{" "}
                      {getUnit(nutrient)}
                    </Label>
                    <Input
                      id={nutrient}
                      type="number"
                      value={value}
                      onChange={(e) =>
                        handleMicronutrientChange(nutrient, e.target.value)
                      }
                      className="bg-gray-800 text-white border-green-500"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 border-green-500 text-blue-200 hover:bg-green-500 hover:text-white"
            >
              {isPage ? "Back to Food Diary" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 bg-green-500 text-white hover:bg-green-600",
                (!overrideCalories && !carbs && !fats && !protein) &&
                  "opacity-50 cursor-not-allowed"
              )}
              disabled={!overrideCalories && (!carbs && !fats && !protein)}
            >
              Add to {meal}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  // If this is a page render, don't wrap in the modal backdrop
  if (isPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-6">
        {content}
      </div>
    )
  }

  // For modal rendering, wrap in the backdrop div but remove the onClick handler
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      )}
    >
      {content}
    </div>
  )
}

function getUnit(nutrient: string): string {
  const units: Record<string, string> = {
    fiber: "(g)",
    sodium: "(mg)",
    sugar: "(g)",
    zinc: "(mg)",
    vitaminA: "(IU)",
    vitaminC: "(mg)",
    vitaminD: "(IU)",
    vitaminE: "(mg)",
    vitaminK: "(mcg)",
    vitaminB1: "(mg)",
    vitaminB2: "(mg)",
    vitaminB3: "(mg)",
    vitaminB5: "(mg)",
    vitaminB6: "(mg)",
    vitaminB7: "(mcg)",
    vitaminB9: "(mcg)",
    vitaminB12: "(mcg)",
    calcium: "(mg)",
    phosphorus: "(mg)",
    magnesium: "(mg)",
    potassium: "(mg)",
    chloride: "(mg)",
    sulfur: "(mg)",
    iron: "(mg)",
    manganese: "(mg)",
    copper: "(mg)",
    iodine: "(mcg)",
    cobalt: "(mcg)",
    fluoride: "(mg)",
    selenium: "(mcg)",
    molybdenum: "(mcg)",
    chromium: "(mcg)"
  }
  return units[nutrient] || ""
}