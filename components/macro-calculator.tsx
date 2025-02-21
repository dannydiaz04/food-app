"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EditFoodEntry {
  food_ky: string;
  userId: string;
  foodName: string;
  meal: string;
  calories: number;
  carbs: number;
  fats: number;
  protein: number;
  date: string;
  // Add other optional micronutrient fields
  [key: string]: any;
}

interface MacroCalculatorProps {
  meal: string
  isOpen?: boolean
  onClose?: () => void
  isPage?: boolean
  initialDate?: string
  editMode?: boolean
  initialFoodEntry?: EditFoodEntry
}

export function MacroCalculator({ 
  meal, 
  isOpen = true, 
  onClose, 
  isPage = false, 
  initialDate,
  editMode = false,
  initialFoodEntry
}: MacroCalculatorProps) {
  const [foodName, setFoodName] = useState("Custom Entry")
  const [calories, setCalories] = useState<number | ''>(0)
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [protein, setProtein] = useState("")

  // Initialize selectedDate as null
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Set the date client-side only
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(new Date(initialDate).toISOString().split('T')[0])
    } else {
      setSelectedDate(new Date().toISOString().split('T')[0])
    }
  }, [initialDate])

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
    vitamin_a: "",
    vitamin_b: "",
    vitamin_b1: "",
    vitamin_b2: "",
    vitamin_b3: "",
    vitamin_b5: "",
    vitamin_b6: "",
    vitamin_b7: "",
    vitamin_b9: "",
    vitamin_b12: "",
    vitamin_c: "",
    vitamin_d: "",
    vitamin_e: "",
    vitamin_k: "",
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

  // Initialize state with edit data if available
  useEffect(() => {
    if (editMode && initialFoodEntry) {
      setFoodName(initialFoodEntry.foodName)
      setCalories(initialFoodEntry.calories)
      setCarbs(initialFoodEntry.carbs.toString())
      setFats(initialFoodEntry.fats.toString())
      setProtein(initialFoodEntry.protein.toString())
      setOverrideCalories(true)
      
      // Set micronutrients if they exist
      const micronutrientUpdates = {} as any
      Object.keys(micronutrients).forEach(key => {
        if (key in initialFoodEntry) {
          micronutrientUpdates[key] = initialFoodEntry[key]?.toString() || ""
        }
      })
      setMicronutrients(prev => ({
        ...prev,
        ...micronutrientUpdates
      }))
    }
  }, [editMode, initialFoodEntry])

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
    if (!selectedDate) return

    try {
      const micronutrientsData = Object.entries(micronutrients).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value ? Number(value) : null
        }),
        {}
      )

      const entryDate = new Date(selectedDate).toISOString()
      
      // Create the request body
      const requestBody = {
        meal,
        foodName: foodName || "Custom Entry",
        calories: Number(calories || 0),
        carbs: Number(carbs || 0),
        fats: Number(fats || 0),
        protein: Number(protein || 0),
        ...micronutrientsData,
        date: entryDate
      }

      const endpoint = editMode && initialFoodEntry 
        ? `/api/food-entries/${initialFoodEntry.food_ky}`
        : "/api/macro-calculator"

      console.log('Making request to:', endpoint, 'with method:', editMode ? 'PUT' : 'POST')
      console.log('Request body:', requestBody)

      const response = await fetch(endpoint, {
        method: editMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (editMode ? "Failed to update food entry" : "Failed to add food entry"))
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
      console.error(editMode ? "Error updating food entry:" : "Error submitting food entry:", error)
      // You might want to show an error message to the user here
      alert(error instanceof Error ? error.message : "An error occurred")
    }
  }

  if (!isOpen && onClose) return null

  const content = (
    <Card className="w-full max-w-md mx-4 border-primary max-h-[90vh] flex flex-col">
      <CardContent className="pt-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-primary">
          Macro Calculator – {meal}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DATE INPUT */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-primary">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-input"
            />
          </div>

          {/* FOOD NAME INPUT */}
          <div className="space-y-2">
            <Label htmlFor="foodName" className="text-primary">
              Food Name
            </Label>
            <Input
              id="foodName"
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Custom Entry"
              className="border-input"
            />
          </div>

          {/* CALORIES INPUT */}
          <div className="space-y-2">
            <Label htmlFor="calories" className="text-primary">
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
                className="border-input bg-background"
                placeholder="Enter calories"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleOverrideCalories}
                className="text-primary hover:text-primary/90"
              >
                {overrideCalories ? "Auto Calculate" : "Add Calories Manually"}
              </Button>
            </div>
          </div>

          {/* CARBOHYDRATES */}
          <div className="space-y-2">
            <Label htmlFor="carbs" className="text-primary">
              Carbohydrates (4 kcal/g)
            </Label>
            <Input
              id="carbs"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="border-input"
              min="0"
              step="0.1"
            />
          </div>

          {/* FATS */}
          <div className="space-y-2">
            <Label htmlFor="fats" className="text-primary">
              Fats (9 kcal/g)
            </Label>
            <Input
              id="fats"
              type="number"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              className="border-input"
              min="0"
              step="0.1"
            />
          </div>

          {/* PROTEIN */}
          <div className="space-y-2">
            <Label htmlFor="protein" className="text-primary">
              Protein (4 kcal/g)
            </Label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="border-input"
              min="0"
              step="0.1"
            />
          </div>

          {/* TOGGLE MICRONUTRIENTS BUTTON */}
          <Button
            type="button"
            variant="outline"
            className="mt-2 text-primary hover:text-primary/90"
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
                    <Label htmlFor={nutrient} className="text-primary">
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
                      className="border-input"
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
              variant="outline"
              className="flex-1"
            >
              {isPage ? "Back to Flavor Journal" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1",
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

  // For modal rendering, wrap in the backdrop div
  return (
    <div className={cn("fixed inset-0 bg-background/80 flex items-center justify-center z-50")}>
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
    vitamin_a: "(IU)",
    vitamin_b: "(IU)",
    vitamin_b1: "(mg)",
    vitamin_b2: "(mg)",
    vitamin_b3: "(mg)",
    vitamin_b5: "(mg)",
    vitamin_b6: "(mg)",
    vitamin_b7: "(mcg)",
    vitamin_b9: "(mcg)",
    vitamin_b12: "(mcg)",
    vitamin_c: "(mg)",
    vitamin_d: "(IU)",
    vitamin_e: "(mg)",
    vitamin_k: "(mcg)",
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