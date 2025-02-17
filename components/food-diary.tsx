"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Calendar, Plus, Settings2 } from "lucide-react"
import Link from "next/link"
import { MacroCalculator } from "@/components/macro-calculator"
import { useRouter } from "next/navigation"
import React from "react"

interface NutritionData {
  calories: number
  carbs: number
  fat: number
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

interface FoodDiaryProps {
  meal: string
}

export function FoodDiary({ meal }: FoodDiaryProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [macroModalOpen, setMacroModalOpen] = useState(false)
  const [macroModalMeal, setMacroModalMeal] = useState("")
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const router = useRouter()

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
      const targetUrl = `/add-food/macro-calculator?meal=${mealName.toLowerCase()}`;
      console.log("Redirecting to URL:", targetUrl);
      router.push(targetUrl);
      console.log("router.push called");
    }, 0);
    console.log("=== handleMacroCalculatorClick END ===");
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Your Food Diary For:</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md">
                <span className="font-medium">{formatDate(currentDate)}</span>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-6 p-6">
            {mealSections.map((section) => (
              <div key={section.name} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Food
                    </Button>
                    <div className="relative" ref={(el) => dropdownRefs.current[section.name] = el}>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Food</TableHead>
                      <TableHead className="text-right">Calories</TableHead>
                      <TableHead className="text-right">Carbs (g)</TableHead>
                      <TableHead className="text-right">Fat (g)</TableHead>
                      <TableHead className="text-right">Protein (g)</TableHead>
                      <TableHead className="text-right">Sodium (mg)</TableHead>
                      <TableHead className="text-right">Sugar (g)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No foods added yet
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            ))}

            <div className="border-t pt-6">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Totals</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell className="text-right">0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Your Daily Goal</TableCell>
                    <TableCell className="text-right">{dailyGoals.calories}</TableCell>
                    <TableCell className="text-right">{dailyGoals.carbs}</TableCell>
                    <TableCell className="text-right">{dailyGoals.fat}</TableCell>
                    <TableCell className="text-right">{dailyGoals.protein}</TableCell>
                    <TableCell className="text-right">{dailyGoals.sodium}</TableCell>
                    <TableCell className="text-right">{dailyGoals.sugar}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Remaining</TableCell>
                    <TableCell className="text-right">{dailyGoals.calories}</TableCell>
                    <TableCell className="text-right">{dailyGoals.carbs}</TableCell>
                    <TableCell className="text-right">{dailyGoals.fat}</TableCell>
                    <TableCell className="text-right">{dailyGoals.protein}</TableCell>
                    <TableCell className="text-right">{dailyGoals.sodium}</TableCell>
                    <TableCell className="text-right">{dailyGoals.sugar}</TableCell>
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
    </>
  )
}