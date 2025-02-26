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
import { Loader2, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react"
import { FoodItem } from "@/types/food"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
  
  // Basic nutrition values
  const [foodName, setFoodName] = useState("")
  const [calories, setCalories] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fats, setFats] = useState(0)
  const [protein, setProtein] = useState(0)
  
  // Meal and date
  const [selectedMeal, setSelectedMeal] = useState("breakfast")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // Micronutrients
  const [sugar, setSugar] = useState(0)
  const [fiber, setFiber] = useState(0)
  const [sodium, setSodium] = useState(0)
  const [calcium, setCalcium] = useState(0)
  const [iron, setIron] = useState(0)
  const [vitaminA, setVitaminA] = useState(0)
  const [vitaminC, setVitaminC] = useState(0)
  
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

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = e.target.value
    setServingSize(newSize)
    
    if (selectedFood && selectedFood.perGramValues) {
      // Scale the nutritional values based on the new serving size
      calculateNutrients(parseFloat(newSize))
    }
  }

  const calculateNutrients = (newSizeInGrams: number) => {
    if (selectedFood?.perGramValues && !isNaN(newSizeInGrams)) {
      const { perGramValues } = selectedFood
      setCalories(Math.round((perGramValues.calories || 0) * newSizeInGrams))
      setCarbs(Math.round((perGramValues.carbs || 0) * newSizeInGrams * 10) / 10)
      setFats(Math.round((perGramValues.fats || 0) * newSizeInGrams * 10) / 10)
      setProtein(Math.round((perGramValues.protein || 0) * newSizeInGrams * 10) / 10)
      
      // Update micronutrients too
      setSugar(Math.round((perGramValues.sugar || 0) * newSizeInGrams * 10) / 10)
      setFiber(Math.round((perGramValues.fiber || 0) * newSizeInGrams * 10) / 10)
      setSodium(Math.round((perGramValues.sodium || 0) * newSizeInGrams))
      setCalcium(Math.round((perGramValues.calcium || 0) * newSizeInGrams))
      setIron(Math.round((perGramValues.iron || 0) * newSizeInGrams * 10) / 10)
      setVitaminA(Math.round((perGramValues.vitamin_a || 0) * newSizeInGrams))
      setVitaminC(Math.round((perGramValues.vitamin_c || 0) * newSizeInGrams))
    }
  }

  const handleConfirm = async () => {
    if (!selectedFood) return;
    
    setIsSaving(true)
    
    try {
      // Create an updated version of the food item
      const updatedFood: FoodItem = {
        ...selectedFood,
        foodName: foodName,
        calories: calories,
        carbs: carbs,
        fats: fats,
        protein: protein,
        sugar: sugar,
        fiber: fiber,
        sodium: sodium,
        calcium: calcium,
        iron: iron,
        vitamin_a: vitaminA,
        vitamin_c: vitaminC,
        serving_size: servingSize,
        serving_size_g: parseFloat(servingSize),
        meal: selectedMeal, // Add the selected meal
        date: selectedDate.toISOString() // Add the selected date
      }
      
      await onConfirm(updatedFood)
      
      // Show confirmation dialog
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error saving food entry:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    onClose() // Close parent dialog too
  }

  const toggleMicronutrients = () => {
    setShowMicronutrients(!showMicronutrients)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Food Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Food Name */}
            <div className="space-y-2">
              <Label htmlFor="foodName">Food Name</Label>
              <Input 
                id="foodName"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Enter food name"
              />
            </div>
            
            {/* Meal Selection */}
            <div className="space-y-2">
              <Label htmlFor="meal">Meal</Label>
              <Select 
                value={selectedMeal} 
                onValueChange={setSelectedMeal}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select meal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Serving Size Section */}
            <div className="space-y-2">
              <Label htmlFor="serving-size">Serving Size</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="serving-size"
                  value={servingSize}
                  onChange={handleServingSizeChange}
                  className="flex-1"
                  type="number"
                  min="0"
                />
                <Select value={unit} onValueChange={(value) => setUnit(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">grams</SelectItem>
                    <SelectItem value="oz">ounces</SelectItem>
                    <SelectItem value="cup">cups</SelectItem>
                    <SelectItem value="tbsp">tbsp</SelectItem>
                    <SelectItem value="tsp">tsp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Nutrition Section - Always Visible */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  value={calories}
                  onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                  className="flex-1"
                  type="number"
                  min="0"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="carbs" className={macroColors.carbs}>Carbs (g)</Label>
                  <Input
                    id="carbs"
                    value={carbs}
                    onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein" className={macroColors.protein}>Protein (g)</Label>
                  <Input
                    id="protein"
                    value={protein}
                    onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fats" className={macroColors.fats}>Fats (g)</Label>
                  <Input
                    id="fats"
                    value={fats}
                    onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Micronutrients Toggle Button */}
            <Button 
              type="button" 
              variant="outline" 
              onClick={toggleMicronutrients}
              className="w-full"
            >
              {showMicronutrients ? (
                <>Hide Micronutrients <ChevronUp className="ml-2 h-4 w-4" /></>
              ) : (
                <>Show Micronutrients <ChevronDown className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            {/* Micronutrients Section - Expandable */}
            {showMicronutrients && (
              <div className="space-y-3 border rounded-md p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="sugar">Sugar (g)</Label>
                    <Input
                      id="sugar"
                      value={sugar}
                      onChange={(e) => setSugar(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input
                      id="fiber"
                      value={fiber}
                      onChange={(e) => setFiber(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="sodium">Sodium (mg)</Label>
                    <Input
                      id="sodium"
                      value={sodium}
                      onChange={(e) => setSodium(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calcium">Calcium (mg)</Label>
                    <Input
                      id="calcium"
                      value={calcium}
                      onChange={(e) => setCalcium(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="iron">Iron (mg)</Label>
                    <Input
                      id="iron"
                      value={iron}
                      onChange={(e) => setIron(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vitaminA">Vitamin A (IU)</Label>
                    <Input
                      id="vitaminA"
                      value={vitaminA}
                      onChange={(e) => setVitaminA(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vitaminC">Vitamin C (mg)</Label>
                    <Input
                      id="vitaminC"
                      value={vitaminC}
                      onChange={(e) => setVitaminC(parseFloat(e.target.value) || 0)}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
            
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