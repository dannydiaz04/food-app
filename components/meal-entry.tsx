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
import { Loader2, Plus, Minus, ChevronDown, ChevronUp, Calculator, Edit } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

interface MealEntryProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (foodData: any, saveToFoodInfo?: boolean) => void
  selectedFood: FoodItem | null
}

// Define colors for macros
const macroColors = {
  carbs: "text-emerald-500", // Replace with actual color class
  protein: "text-amber-500", // Replace with actual color class
  fats: "text-purple-500", // Replace with actual color class
};

// Define conversion factors to grams
const unitConversions = {
  g: 1,
  oz: 28.3495,
  cup: 236.588,
  tbsp: 14.7868,
  tsp: 4.92892
};

export function MealEntry({ isOpen, onClose, onConfirm, selectedFood }: MealEntryProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [servingSize, setServingSize] = useState("")
  const [unit, setUnit] = useState("g")
  
  // Basic nutrition values
  const [foodName, setFoodName] = useState("")
  const [calories, setCalories] = useState<number | "">("")
  const [carbs, setCarbs] = useState<number | "">("")
  const [fats, setFats] = useState<number | "">("")
  const [protein, setProtein] = useState<number | "">("")
  
  // Meal and date
  const [selectedMeal, setSelectedMeal] = useState("breakfast")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // Micronutrients
  const [sugar, setSugar] = useState<number | "">("")
  const [fiber, setFiber] = useState<number | "">("")
  const [sodium, setSodium] = useState<number | "">("")
  const [calcium, setCalcium] = useState<number | "">("")
  const [iron, setIron] = useState<number | "">("")
  const [vitaminA, setVitaminA] = useState<number | "">("")
  const [vitaminC, setVitaminC] = useState<number | "">("")
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showMicronutrients, setShowMicronutrients] = useState(false)
  const [autoCalculateCalories, setAutoCalculateCalories] = useState(true)
  const [saveToDatabase, setSaveToDatabase] = useState(false)

  // Auto-calculate calories based on macros
  useEffect(() => {
    if (autoCalculateCalories) {
      const carbsValue = typeof carbs === "number" ? carbs : 0;
      const proteinValue = typeof protein === "number" ? protein : 0;
      const fatsValue = typeof fats === "number" ? fats : 0;
      
      const calculatedCalories = Math.round(
        (carbsValue * 4) + (proteinValue * 4) + (fatsValue * 9)
      );
      
      setCalories(calculatedCalories || "");
    }
  }, [carbs, protein, fats, autoCalculateCalories]);

  // Handle manual calories input, turn off auto-calculation
  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setCalories("");
      // Don't enable auto-calculation when clearing the field
    } else {
      setCalories(parseFloat(value));
      setAutoCalculateCalories(false);
    }
  };

  // Add handlers for macro updates that enable auto-calculation
  const handleCarbsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarbs(value === "" ? "" : parseFloat(value));
    // Only enable auto-calculation if there's a value
    if (value !== "") {
      setAutoCalculateCalories(true);
    }
  };

  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProtein(value === "" ? "" : parseFloat(value));
    // Only enable auto-calculation if there's a value
    if (value !== "") {
      setAutoCalculateCalories(true);
    }
  };

  const handleFatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFats(value === "" ? "" : parseFloat(value));
    // Only enable auto-calculation if there's a value
    if (value !== "") {
      setAutoCalculateCalories(true);
    }
  };

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
      
      // Turn off auto-calculation initially when loading food
      setAutoCalculateCalories(false)
    }
  }, [selectedFood])

  useEffect(() => {
    if (selectedFood) {
      setFoodName(selectedFood.foodName || "")
      setCalories(selectedFood.calories || 0)
      setCarbs(selectedFood.carbs || 0)
      setProtein(selectedFood.protein || 0)
      setFats(selectedFood.fats || 0)
    }
  }, [selectedFood])

  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setSelectedDate(new Date(formattedDate))
  }, [])

  const handleUnitChange = (newUnit: string) => {
    if (selectedFood?.perGramValues && servingSize !== "") {
      // Convert current serving size from old unit to grams
      const currentSizeInGrams = parseFloat(servingSize) * unitConversions[unit as keyof typeof unitConversions];
      
      // Convert from grams to the new unit
      const newSizeInNewUnit = currentSizeInGrams / unitConversions[newUnit as keyof typeof unitConversions];
      
      // Update serving size value with the converted amount (rounded to 1 decimal place)
      setServingSize(Math.round(newSizeInNewUnit * 10) / 10 + "");
      
      // Update the unit
      setUnit(newUnit);
      
      // Nutrition values stay the same as they're based on the same amount of food,
      // just expressed in different units
    } else {
      // If there's no serving size or food data, just update the unit
      setUnit(newUnit);
    }
  };

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = e.target.value
    setServingSize(newSize)
    
    if (selectedFood && selectedFood.perGramValues && newSize !== "") {
      // Convert the new serving size to grams based on the selected unit
      const newSizeInGrams = parseFloat(newSize) * unitConversions[unit as keyof typeof unitConversions];
      
      // Scale the nutritional values based on the new serving size in grams
      calculateNutrients(newSizeInGrams)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const foodData = {
        foodName,
        calories: calories,
        carbs: carbs,
        protein: protein,
        fats: fats,
        meal: selectedMeal,
        date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        // Include other fields as needed
        sugar: sugar,
        fiber: fiber,
        sodium: sodium,
        calcium: calcium,
        iron: iron,
        vitamin_a: vitaminA,
        vitamin_c: vitaminC,
      };
      
      onConfirm(foodData, saveToDatabase);
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    onClose() // Close parent dialog too
  }

  const toggleMicronutrients = () => {
    setShowMicronutrients(!showMicronutrients)
  }

  const toggleCaloriesEditMode = () => {
    setAutoCalculateCalories(!autoCalculateCalories);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                <Select value={unit} onValueChange={handleUnitChange}>
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
                <div className="flex">
                  <Input
                    id="calories"
                    value={calories}
                    onChange={handleCaloriesChange}
                    className="flex-1 rounded-r-none"
                    type="number"
                    min="0"
                    disabled={autoCalculateCalories}
                  />
                  <Button 
                    type="button"
                    onClick={toggleCaloriesEditMode} 
                    variant="outline" 
                    size="icon"
                    className="rounded-l-none border-l-0"
                    title={autoCalculateCalories ? "Switch to manual entry" : "Switch to auto-calculation"}
                  >
                    {autoCalculateCalories ? <Edit className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {autoCalculateCalories 
                    ? "Calories are calculated from macros (4 cal/g carbs, 4 cal/g protein, 9 cal/g fat)" 
                    : "Manual entry mode"}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="carbs" className={macroColors.carbs}>Carbs (g)</Label>
                  <Input
                    id="carbs"
                    value={carbs}
                    onChange={handleCarbsChange}
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
                    onChange={handleProteinChange}
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
                    onChange={handleFatsChange}
                    className="flex-1"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Add this after the macro inputs */}
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="auto-calculate"
                  checked={autoCalculateCalories}
                  onCheckedChange={(checked) => setAutoCalculateCalories(checked === true)}
                />
                <label 
                  htmlFor="auto-calculate"
                  className="text-sm text-muted-foreground"
                >
                  Auto-calculate calories from macros
                </label>
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
                      onChange={(e) => setSugar(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                      onChange={(e) => setFiber(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                      onChange={(e) => setSodium(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calcium">Calcium (mg)</Label>
                    <Input
                      id="calcium"
                      value={calcium}
                      onChange={(e) => setCalcium(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                      onChange={(e) => setIron(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                      onChange={(e) => setVitaminA(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vitaminC">Vitamin C (mg)</Label>
                    <Input
                      id="vitaminC"
                      value={vitaminC}
                      onChange={(e) => setVitaminC(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 mt-4 mb-2">
              <Checkbox 
                id="saveToDatabase" 
                checked={saveToDatabase}
                onCheckedChange={(checked) => setSaveToDatabase(checked === true)}
              />
              <label
                htmlFor="saveToDatabase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Save to my food database for future use
              </label>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving} className="flex-1 sm:flex-none">
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