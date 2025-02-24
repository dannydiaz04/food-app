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
  onConfirm: () => void
  selectedFood: FoodItem | null
}

export function MealEntry({ isOpen, onClose, onConfirm, selectedFood }: MealEntryProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [servingSize, setServingSize] = useState(selectedFood?.serving_size || "")
  const [unit, setUnit] = useState(selectedFood?.unit || "")
  const [calories, setCalories] = useState(selectedFood?.calories || 0)
  const [carbs, setCarbs] = useState(selectedFood?.carbs || 0)
  const [fats, setFats] = useState(selectedFood?.fats || 0)
  const [protein, setProtein] = useState(selectedFood?.protein || 0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showMicronutrients, setShowMicronutrients] = useState(false)

  useEffect(() => {
    if (selectedFood) {
      setServingSize(selectedFood.serving_size)
      setUnit(selectedFood.unit)
      setCalories(selectedFood.calories)
      setCarbs(selectedFood.carbs)
      setFats(selectedFood.fats)
      setProtein(selectedFood.protein)
    }
  }, [selectedFood])

  const adjustMacros = (newServingSize: string, newUnit: string) => {
    const originalServingSize = parseFloat(selectedFood?.serving_size) || 1
    const originalCalories = selectedFood?.calories || 0
    const originalCarbs = selectedFood?.carbs || 0
    const originalFats = selectedFood?.fats || 0
    const originalProtein = selectedFood?.protein || 0

    const newServingSizeValue = parseFloat(newServingSize) || 0
    const adjustmentFactor = newServingSizeValue / originalServingSize

    setCalories(Math.round(originalCalories * adjustmentFactor))
    setCarbs(Math.round(originalCarbs * adjustmentFactor * 10) / 10)
    setFats(Math.round(originalFats * adjustmentFactor * 10) / 10)
    setProtein(Math.round(originalProtein * adjustmentFactor * 10) / 10)
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
    setIsSaving(true)
    try {
      await onConfirm()
      setShowConfirmation(true)
      onClose()
    } catch (error) {
      console.error('Error saving meal entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedFood) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
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
                  <div>Carbs: {carbs}g</div>
                  <div>Fats: {fats}g</div>
                  <div>Protein: {protein}g</div>
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={() => setShowConfirmation(false)}>
        <DialogContent className="max-w-[275px] w-full sm:max-w-[275px]">
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
          </DialogHeader>
          <p>Your food has been saved to your meal and flavor journal!</p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowConfirmation(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}