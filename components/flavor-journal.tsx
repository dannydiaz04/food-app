"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Calendar, Plus, Settings2, Loader2, Trash2, Edit2 } from "lucide-react"
import Link from "next/link"
import { MacroCalculator } from "@/components/macro-calculator"
import { useRouter } from "next/navigation"
import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertVariantProps } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { MealEntry } from "@/components/meal-entry"

interface NutritionData {
  calories: number
  carbs: number
  fats: number
  protein: number
  sodium: number
  sugar: number
}

interface MealSection {
  name: string
  items: Array<{
    name: string
    nutrition: NutritionData
  }>
}

interface FlavorJournalProps {
  meal?: string  // Make meal optional since it's not used
}

interface FoodEntry {
  food_ky: string
  userId: string
  foodName: string
  meal: string
  calories: number
  carbs: number
  fats: number
  protein: number
  sodium: number
  sugar: number
  date: string
}

interface EditFoodEntry extends FoodEntry {
  quantity?: number;
  unit?: string;
}

export function FlavorJournal({ meal = '' }: FlavorJournalProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [macroModalOpen, setMacroModalOpen] = useState(false)
  const [macroModalMeal, setMacroModalMeal] = useState("")
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const router = useRouter()
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editEntry, setEditEntry] = useState<EditFoodEntry | null>(null)
  const [showMealEntry, setShowMealEntry] = useState(false)
  const [selectedFood, setSelectedFood] = useState<NutritionData | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownOpen) {
        const activeRef = dropdownRefs.current[dropdownOpen]
        if (activeRef && !activeRef.contains(event.target as Node)) {
          setDropdownOpen(null)
        }
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  useEffect(() => {
    const fetchFoodEntries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/food-entries', {
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch food entries')
        }

        const data = await response.json()
        setFoodEntries(data)
      } catch (error) {
        console.error('Error fetching food entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFoodEntries()
  }, [])

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const dailyGoals = {
    calories: 2033,
    carbs: 202,
    fat: 45,
    protein: 205,
    sodium: 2300,
    sugar: 76,
  }

  const mealSections: MealSection[] = [
    { name: "breakfast", items: [] },
    { name: "lunch", items: [] },
    { name: "dinner", items: [] },
    { name: "snacks", items: [] },
  ]

  const formatDate = (date: Date | null) => {
    if (!date) return "Loading..."
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateDate = (days: number) => {
    if (!currentDate) return
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const handleQuickToolsClick = (mealName: string) => {
    console.log("Quick Tools clicked for meal:", mealName);
    console.log("Current dropdownOpen state:", dropdownOpen);
    console.log("Are they equal?:", dropdownOpen === mealName);
    console.log("Current section.name:", mealName);
    if (dropdownOpen === mealName) {
      setDropdownOpen(null);  // If clicking the same section, close it
    } else {
      setDropdownOpen(mealName);  // If clicking a different section, open it
    }
    // Log the state after update
    setTimeout(() => {
      console.log("Updated dropdownOpen state:", dropdownOpen);
    }, 0);
  }

  const handleMacroCalculatorClick = (mealName: string) => {
    console.log("=== handleMacroCalculatorClick START ===");
    console.log("Macro Calculator Clicked with meal:", mealName);
    if (!mealName) {
      console.error("No meal provided to handleMacroCalculatorClick");
      return;
    }
    console.log("About to close dropdown");
    setDropdownOpen(null); // Close the dropdown first
    setTimeout(() => {
      console.log("In setTimeout, preparing to redirect");
      // Format the date properly to avoid timezone issues
      let dateParam = getDateParam(currentDate);
      const targetUrl = `/add-food/macro-calculator?meal=${mealName.toLowerCase()}&date=${dateParam}`;
      console.log("Redirecting to URL:", targetUrl);
      router.push(targetUrl);
      console.log("router.push called");
    }, 0);
    console.log("=== handleMacroCalculatorClick END ===");
  };

  const isMobile = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  };

  // Helper function to format date to YYYY-MM-DD for comparison
  const formatDateForComparison = (date: Date | null): string => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  // Helper function to compare dates (only year, month, day)
  const isSameDay = (dateStr: string, compareDate: Date | null): boolean => {
    if (!compareDate || !dateStr) return false
    const date1 = dateStr.split('T')[0] // Get YYYY-MM-DD from ISO string
    const date2 = formatDateForComparison(compareDate)
    
    console.log('Comparing dates (entry.date & then currentDate):', {
      entryDate: date1,
      currentDate: date2,
      isMatch: date1 === date2
    })
    
    return date1 === date2
  }

  const dailyTotals = foodEntries
    .filter(entry => isSameDay(entry.date, currentDate))
    .reduce((acc, entry) => ({
      calories: acc.calories + entry.calories,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fats,
      protein: acc.protein + entry.protein,
      sodium: acc.sodium + entry.sodium,
      sugar: acc.sugar + entry.sugar,
    }), {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      sodium: 0,
      sugar: 0,
    })

  const remaining = {
    calories: dailyGoals.calories - dailyTotals.calories,
    carbs: dailyGoals.carbs - dailyTotals.carbs,
    fat: dailyGoals.fat - dailyTotals.fat,
    protein: dailyGoals.protein - dailyTotals.protein,
    sodium: dailyGoals.sodium - dailyTotals.sodium,
    sugar: dailyGoals.sugar - dailyTotals.sugar,
  }

  const handleDeleteEntry = async (food_ky: string) => {
    try {
      setDeleteError(null)
      
      // Add console.log to show client-side URL
      console.log('Client-side DELETE request URL:', `/api/food-entries/${food_ky}`)
      
      const response = await fetch(`/api/food-entries/${food_ky}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        let errorMessage = 'Failed to delete entry'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        setDeleteError(errorMessage)
        return
      }

      // If successful, update the UI
      setFoodEntries(prevEntries => 
        prevEntries.filter(entry => entry.food_ky !== food_ky)
      )
      setDeleteEntryId(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting'
      setDeleteError(errorMessage)
    }
  }

  const handleEditClick = (entry: FoodEntry) => {
    setEditEntry(entry)
  }

  const handleEditClose = () => {
    setEditEntry(null)
  }

  // Update the table header and rows to be more mobile-friendly
  const TableHeaderContent = () => (
    <TableRow className="bg-muted/70 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/30">
      <TableHead className="w-[140px] sm:w-[300px] font-semibold text-primary">Food</TableHead>
      <TableHead className="text-right font-semibold text-primary text-sm sm:text-base">Calories</TableHead> 
      <TableHead className="text-right hidden xs:table-cell font-semibold text-primary">Carbs</TableHead>
      <TableHead className="text-right hidden xs:table-cell font-semibold text-primary">Fat</TableHead>
      <TableHead className="text-right hidden xs:table-cell font-semibold text-primary">Protein</TableHead>
      <TableHead className="text-right hidden sm:table-cell font-semibold text-primary">Sodium</TableHead>
      <TableHead className="text-right hidden sm:table-cell font-semibold text-primary">Sugar</TableHead>
      <TableHead className="text-right w-[80px] font-semibold text-primary">Actions</TableHead>
    </TableRow>
  )

  const confirmSave = async () => {
    if (!selectedFood) return
    try {
      setIsLoading(true)
      const response = await fetch("/api/macro-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedFood,
          meal,
          date: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to save food entry")
      }
      setShowMealEntry(false)
      setSelectedFood(null)
      router.refresh()
    } catch (err) {
      console.error("Error saving food entry:", err)
      alert("Failed to save food entry")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSearchResult = (product: OpenFoodProduct) => {
    // ... existing code to process the product ...
    
    setSelectedFood(foodData)
    setShowMealEntry(true) // Show the MealEntry dialog instead of expanding the row
  }

  // Add this function to FlavorJournal component
  const getDateParam = (date: Date | null): string => {
    if (!date) return '';
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    ).toISOString();
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-base sm:text-lg font-semibold">Your Flavor Journal For:</div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-md flex-1 sm:flex-initial justify-center">
                <span className="font-medium text-sm sm:text-base truncate">{formatDate(currentDate)}</span>
                <Calendar className="h-4 w-4 text-primary hidden xs:block" />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-4 sm:gap-6 p-2 sm:p-6">
            {mealSections.map((section) => (
              <div key={section.name} className="space-y-3 sm:space-y-4">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 bg-muted/50 dark:bg-muted/20 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground/90">
                    {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
                  </h3>
                  <div className="flex gap-2 w-full xs:w-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary flex-1 xs:flex-none hover:bg-primary/10 hover:shadow-md transition-shadow duration-200 h-8"
                      asChild
                    >
                      <Link href={`/add-food/${section.name.toLowerCase()}?date=${getDateParam(currentDate)}`}>
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden xs:inline">Add Food</span>
                        <span className="xs:hidden">Add Food</span>
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-md border bg-card shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableHeaderContent />
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : foodEntries.filter(entry => {
                        const isMatchingMeal = entry.meal.toLowerCase() === section.name.toLowerCase()
                        const isMatchingDate = isSameDay(entry.date, currentDate)
                        
                        console.log('Filtering entry:', {
                          foodName: entry.foodName,
                          entryDate: entry.date,
                          currentDate: currentDate?.toISOString(),
                          isMatchingMeal,
                          isMatchingDate
                        })
                        
                        return isMatchingMeal && isMatchingDate
                      }).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No foods added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        foodEntries
                          .filter(entry => 
                            entry.meal.toLowerCase() === section.name.toLowerCase() &&
                            isSameDay(entry.date, currentDate)
                          )
                          .map((entry) => (
                            <TableRow 
                              key={entry.food_ky}
                              className="border-b border-border/50 transition-colors bg-background hover:bg-accent/50 dark:bg-muted/5 dark:hover:bg-accent/20"
                            >
                              <TableCell className="w-[140px] sm:w-[300px] font-medium text-foreground/90">
                                <div className="whitespace-normal text-sm sm:text-base">{entry.foodName}</div>
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-foreground/80 text-sm sm:text-base whitespace-normal">{entry.calories}</TableCell>
                              <TableCell className="text-right hidden xs:table-cell tabular-nums text-foreground/80">{entry.carbs}</TableCell>
                              <TableCell className="text-right hidden xs:table-cell tabular-nums text-foreground/80">{entry.fats}</TableCell>
                              <TableCell className="text-right hidden xs:table-cell tabular-nums text-foreground/80">{entry.protein}</TableCell>
                              <TableCell className="text-right hidden sm:table-cell tabular-nums text-foreground/80">{entry.sodium}</TableCell>
                              <TableCell className="text-right hidden sm:table-cell tabular-nums text-foreground/80">{entry.sugar}</TableCell>
                              <TableCell className="text-right p-1 sm:p-4">
                                <div className="flex justify-end gap-1 sm:gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => handleEditClick(entry)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteEntryId(entry.food_ky)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}

            <div className="border-t pt-6 overflow-x-auto">
              <Table>
                <TableBody>
                  <TableRow className="border-b border-border/50 bg-muted/40 dark:bg-muted/20">
                    <TableCell className="font-medium">Totals</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{dailyTotals.calories?.toString() || '0'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{dailyTotals.carbs?.toString() || '0'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{dailyTotals.fat?.toString() || '0'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{dailyTotals.protein?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium tabular-nums">{dailyTotals.sodium?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium tabular-nums">{dailyTotals.sugar?.toString() || '0'}</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-border/50 bg-primary/10 dark:bg-primary/20">
                    <TableCell className="font-medium text-primary">Daily Goal</TableCell>
                    <TableCell className="text-right font-medium text-primary tabular-nums">{dailyGoals.calories?.toString()}</TableCell>
                    <TableCell className="text-right font-medium text-primary tabular-nums">{dailyGoals.carbs?.toString()}</TableCell>
                    <TableCell className="text-right font-medium text-primary tabular-nums">{dailyGoals.fat?.toString()}</TableCell>
                    <TableCell className="text-right font-medium text-primary tabular-nums">{dailyGoals.protein?.toString()}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium text-primary tabular-nums">{dailyGoals.sodium?.toString()}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium text-primary tabular-nums">{dailyGoals.sugar?.toString()}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/60 dark:bg-muted/30">
                    <TableCell className="font-medium">Remaining</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{remaining.calories?.toString() || '0'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{remaining.carbs?.toString() || '0'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{remaining.fat?.toString() || '0'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{remaining.protein?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium tabular-nums">{remaining.sodium?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium tabular-nums">{remaining.sugar?.toString() || '0'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <MacroCalculator 
        meal={macroModalMeal}
        isOpen={macroModalOpen}
        onClose={() => setMacroModalOpen(false)}
      />

      {editEntry && (
        <MacroCalculator
          meal={editEntry.meal}
          isOpen={true}
          onClose={handleEditClose}
          editMode={true}
          initialFoodEntry={editEntry}
        />
      )}

      <AlertDialog open={!!deleteEntryId} onOpenChange={() => {
        setDeleteEntryId(null)
        setDeleteError(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <div className="text-sm text-muted-foreground">
              This will permanently delete this food entry. This action cannot be undone.
            </div>
            {deleteError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteEntryId) {
                  handleDeleteEntry(deleteEntryId)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MealEntry
        isOpen={showMealEntry}
        onClose={() => setShowMealEntry(false)}
        onConfirm={confirmSave}
        selectedFood={selectedFood}
      />
    </>
  )
}