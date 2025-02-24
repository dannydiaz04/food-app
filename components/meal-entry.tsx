"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { FoodItem } from "@/types/food"

interface MealEntryProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (updatedFood: FoodItem) => Promise<void>
  selectedFood: FoodItem | null
}

// Define colors for macros
const macroColors = {
  carbs: "text-emerald-500", // Replace with actual color class
  protein: "text-amber-500", // Replace with actual color class
  fats: "text-purple-500", // Replace with actual color class
};

export function MealEntry({ isOpen, onClose, onConfirm, selectedFood }: MealEntryProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [servingSize, setServingSize] = useState("")
  const [unit, setUnit] = useState("g")
  const [calories, setCalories] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fats, setFats] = useState(0)
  const [protein, setProtein] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showMicronutrients, setShowMicronutrients] = useState(false)

  useEffect(() => {
    if (selectedFood && selectedFood.perGramValues) {
      // Initialize with the serving size in grams
      const servingSizeInGrams = selectedFood.serving_size_g || 100
      setServingSize(String(servingSizeInGrams))
      setUnit("g") // Always start with grams

      // Calculate initial values based on per gram values
      setCalories(Math.round(selectedFood.perGramValues.calories * servingSizeInGrams))
      setCarbs(Math.round(selectedFood.perGramValues.carbs * servingSizeInGrams * 10) / 10)
      setFats(Math.round(selectedFood.perGramValues.fats * servingSizeInGrams * 10) / 10)
      setProtein(Math.round(selectedFood.perGramValues.protein * servingSizeInGrams * 10) / 10)
      
      // Reset confirmation state
      setShowConfirmation(false)
    }
  }, [selectedFood])

  const adjustMacros = (newServingSize: string, newUnit: string) => {
    if (!selectedFood?.perGramValues) return

    // Convert the new serving size to grams
    const newServingSizeNum = parseFloat(newServingSize) || 0
    let servingSizeInGrams: number

    switch (newUnit) {
      case "oz":
        servingSizeInGrams = newServingSizeNum * 28.3495
        break
      case "cup":
        servingSizeInGrams = newServingSizeNum * 236.588
        break
      case "tbsp":
        servingSizeInGrams = newServingSizeNum * 14.7868
        break
      case "tsp":
        servingSizeInGrams = newServingSizeNum * 4.92892
        break
      default: // grams
        servingSizeInGrams = newServingSizeNum
    }

    // Update all macros based on the per gram values
    setCalories(Math.round(selectedFood.perGramValues.calories * servingSizeInGrams))
    setCarbs(Math.round(selectedFood.perGramValues.carbs * servingSizeInGrams * 10) / 10)
    setFats(Math.round(selectedFood.perGramValues.fats * servingSizeInGrams * 10) / 10)
    setProtein(Math.round(selectedFood.perGramValues.protein * servingSizeInGrams * 10) / 10)
  }

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = e.target.value
    setServingSize(newSize)
    adjustMacros(newSize, unit)
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value
    setUnit(newUnit)
    adjustMacros(servingSize, newUnit)
  }

  const handleConfirm = async () => {
    if (!selectedFood) return
    
    setIsSaving(true)
    try {
      const updatedFood: FoodItem = {
        ...selectedFood,
        serving_size: servingSize,
        serving_size_g: parseFloat(servingSize),
        unit,
        calories,
        carbs,
        fats,
        protein
      }

      // Save to food_info table
      try {
        await fetch('/api/save-food', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFood),
        });
        // We don't need to wait for the response or handle errors
        // as this is a background operation
      } catch (error) {
        console.error('Error saving to food database:', error);
        // Don't interrupt the main flow if this fails
      }

      await onConfirm(updatedFood)
      setShowConfirmation(true)
    } catch (error) {
      console.error('Error saving meal entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    onClose()
  }

  // If the main dialog is closed but not through the confirmation flow,
  // make sure to reset the confirmation state
  const handleMainDialogClose = (open: boolean) => {
    if (!open && !showConfirmation) {
      onClose()
    }
  }

  if (!selectedFood) return null

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={handleMainDialogClose}>
        <DialogContent className="max-w-[325px] w-full sm:max-w-[325px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meal Entry</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <div className="space-y-2">
              {/* Food Name and Brand */}
              <div className="break-words">
                <Label className="text-base font-semibold">{selectedFood.foodName}</Label>
                {selectedFood.brands && (
                  <p className="text-sm text-muted-foreground break-words">{selectedFood.brands}</p>
                )}
              </div>

              {/* Serving Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm">Serving Size</Label>
                  <Input
                    type="text"
                    value={servingSize}
                    onChange={handleServingSizeChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unit</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={unit}
                    onChange={handleUnitChange}
                  >
                    <option value="g">grams (g)</option>
                    <option value="oz">ounces (oz)</option>
                    <option value="tbsp">tablespoons (tbsp)</option>
                    <option value="tsp">teaspoons (tsp)</option>
                    <option value="cup">cups</option>
                  </select>
                </div>
              </div>

              {/* Macronutrients */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Macronutrients</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>Calories: {calories}</div>
                  <div>Carbs: <span className={macroColors.carbs}>{carbs}g</span></div>
                  <div>Fats: <span className={macroColors.fats}>{fats}g</span></div>
                  <div>Protein: <span className={macroColors.protein}>{protein}g</span></div>
                  {selectedFood.sugar !== undefined && <div>Sugar: {selectedFood.sugar}g</div>}
                  {selectedFood.fiber !== undefined && <div>Fiber: {selectedFood.fiber}g</div>}
                </div>
              </div>

              {/* Micronutrients Button */}
              <Button 
                onClick={() => setShowMicronutrients(!showMicronutrients)}
                className="w-full sm:w-auto"
              >
                {showMicronutrients ? 'Hide Micronutrients' : 'Show Micronutrients'}
              </Button>

              {/* Micronutrients */}
              {showMicronutrients && (
                (selectedFood.vitamin_a !== undefined ||
                  selectedFood.vitamin_c !== undefined ||
                  selectedFood.calcium !== undefined ||
                  selectedFood.iron !== undefined ||
                  selectedFood.sodium !== undefined) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Micronutrients</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {selectedFood.sodium !== undefined && <div>Sodium: {Math.round(selectedFood.sodium)}mg</div>}
                      {selectedFood.vitamin_a !== undefined && <div>Vitamin A: {Math.round(selectedFood.vitamin_a)}IU</div>}
                      {selectedFood.vitamin_c !== undefined && <div>Vitamin C: {Math.round(selectedFood.vitamin_c)}mg</div>}
                      {selectedFood.calcium !== undefined && <div>Calcium: {Math.round(selectedFood.calcium)}mg</div>}
                      {selectedFood.iron !== undefined && <div>Iron: {Math.round(selectedFood.iron)}mg</div>}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isSaving} className="flex-1 sm:flex-none">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Separate from the main dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Your food has been saved to your meal and flavor journal!</p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleConfirmationClose}
              className="w-full sm:w-auto"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}