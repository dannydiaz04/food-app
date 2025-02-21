"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Calendar, Plus, Settings2, Loader2, Trash2 } from "lucide-react"
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

export function FlavorJournal({ meal = '' }: FlavorJournalProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [macroModalOpen, setMacroModalOpen] = useState(false)
  const [macroModalMeal, setMacroModalMeal] = useState("")
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const router = useRouter()
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
  }, [currentDate])

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateDate = (days: number) => {
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
      const targetUrl = `/add-food/macro-calculator?meal=${mealName.toLowerCase()}&date=${currentDate.toISOString()}`;
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

  const dailyTotals = foodEntries
    .filter(entry => new Date(entry.date).toDateString() === currentDate.toDateString())
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

  return (
    <>
      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-lg font-semibold">Your Flavor Journal For:</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md">
                <span className="font-medium text-sm sm:text-base">{formatDate(currentDate)}</span>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-6 p-2 sm:p-6">
            {mealSections.map((section) => (
              <div key={section.name} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary flex-1 sm:flex-none"
                      asChild
                    >
                      <Link href={`/add-food/${section.name.toLowerCase()}?date=${currentDate.toISOString()}`}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Food
                      </Link>
                    </Button>
                    <div className="relative flex-1 sm:flex-none" ref={(el) => {
                      if (el) {
                        dropdownRefs.current[section.name] = el;
                      }
                    }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => handleQuickToolsClick(section.name)}
                      >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Quick Tools
                      </Button>
                      {dropdownOpen === section.name && (
                        <>
                          {console.log("Rendering dropdown for section:", section.name)}
                          <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-50">
                            <button
                              className="w-full px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Macro Calculator button clicked");
                                console.log("Section:", section.name);
                                console.log("Event target:", e.currentTarget);
                                console.log("Dropdown state when clicked:", dropdownOpen);
                                console.log("Current section.name:", section.name);
                                console.log("Are they equal?:", dropdownOpen === section.name);
                                handleMacroCalculatorClick(section.name);
                              }}
                            >
                              Macro Calculator
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px] sm:w-[300px]">Food</TableHead>
                        <TableHead className="text-right">Cal</TableHead>
                        <TableHead className="text-right">Carbs</TableHead>
                        <TableHead className="text-right">Fat</TableHead>
                        <TableHead className="text-right">Protein</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Sodium</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Sugar</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
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
                      ) : foodEntries.filter(entry => 
                          entry.meal.toLowerCase() === section.name.toLowerCase() &&
                          new Date(entry.date).toDateString() === currentDate.toDateString()
                        ).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No foods added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        foodEntries
                          .filter(entry => 
                            entry.meal.toLowerCase() === section.name.toLowerCase() &&
                            new Date(entry.date).toDateString() === currentDate.toDateString()
                          )
                          .map((entry) => (
                            <TableRow key={entry.food_ky}>
                              <TableCell className="w-[140px] sm:w-[300px]">{entry.foodName}</TableCell>
                              <TableCell className="text-right">{entry.calories?.toString() || '0'}</TableCell>
                              <TableCell className="text-right">{entry.carbs?.toString() || '0'}</TableCell>
                              <TableCell className="text-right">{entry.fats?.toString() || '0'}</TableCell>
                              <TableCell className="text-right">{entry.protein?.toString() || '0'}</TableCell>
                              <TableCell className="text-right hidden sm:table-cell">{entry.sodium?.toString() || '0'}</TableCell>
                              <TableCell className="text-right hidden sm:table-cell">{entry.sugar?.toString() || '0'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteEntryId(entry.food_ky)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
                  <TableRow>
                    <TableCell className="font-medium">Totals</TableCell>
                    <TableCell className="text-right">{dailyTotals.calories?.toString() || '0'}</TableCell>
                    <TableCell className="text-right">{dailyTotals.carbs?.toString() || '0'}</TableCell>
                    <TableCell className="text-right">{dailyTotals.fat?.toString() || '0'}</TableCell>
                    <TableCell className="text-right">{dailyTotals.protein?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{dailyTotals.sodium?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{dailyTotals.sugar?.toString() || '0'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Daily Goal</TableCell>
                    <TableCell className="text-right">{dailyGoals.calories?.toString()}</TableCell>
                    <TableCell className="text-right">{dailyGoals.carbs?.toString()}</TableCell>
                    <TableCell className="text-right">{dailyGoals.fat?.toString()}</TableCell>
                    <TableCell className="text-right">{dailyGoals.protein?.toString()}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{dailyGoals.sodium?.toString()}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{dailyGoals.sugar?.toString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Remaining</TableCell>
                    <TableCell className="text-right">{remaining.calories?.toString() || '0'}</TableCell>
                    <TableCell className="text-right">{remaining.carbs?.toString() || '0'}</TableCell>
                    <TableCell className="text-right">{remaining.fat?.toString() || '0'}</TableCell>
                    <TableCell className="text-right">{remaining.protein?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{remaining.sodium?.toString() || '0'}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{remaining.sugar?.toString() || '0'}</TableCell>
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
    </>
  )
}