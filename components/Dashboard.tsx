"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Flame } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { useState, useEffect } from "react"

// Define the structure for daily data
interface DailyData {
  date: string
  calories: number
  carbs: number
  fats: number
  protein: number
  sodium: number
  sugar: number
  fiber: number
}

interface DashboardProps {
  totals: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sodium: number
    sugar: number
    fiber: number
  }
  goals: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sodium: number
    sugar: number
    fiber: number
  }
  remaining: {
    calories: number
    carbs: number
    fats: number
    protein: number
  }
  // Add weekly data prop
  weeklyData: DailyData[]
}

export function Dashboard({ totals, goals, remaining, weeklyData: initialWeeklyData = [] }: DashboardProps) {
  const [weeklyData, setWeeklyData] = useState<DailyData[]>(initialWeeklyData)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch weekly data when component mounts
  useEffect(() => {
    async function fetchWeeklyData() {
      try {
        const response = await fetch("/api/food-entries/weekly")
        if (response.ok) {
          const data = await response.json()
          setWeeklyData(data)
        }
      } catch (error) {
        console.error("Error fetching weekly data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeklyData()
  }, [])

  // Get days of the week starting from Monday of current week
  const getDaysOfWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust to make Monday the first day

    const monday = new Date(today)
    monday.setDate(today.getDate() - diff)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      days.push(day)
    }

    return days
  }

  const daysOfWeek = getDaysOfWeek()
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Add default goal values if not provided
  const defaultGoals = {
    calories: 2000,
    carbs: 250, // 50% of calories (2000 * 0.5 / 4)
    protein: 150, // 30% of calories (2000 * 0.3 / 4)
    fats: 44, // 20% of calories (2000 * 0.2 / 9)
    sodium: 2300,
    sugar: 36,
    fiber: 28,
  }

  // Use these defaults if goals aren't provided
  const calorieGoal = goals?.calories || defaultGoals.calories

  // Add this calculation before the return statement
  const weeklyTotalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Today</h1>
          </div>
          {/* TODO: Add day streak counter*/}
          {/* <div className="text-right">
            <span className="text-2xl font-bold">{totals.calories > 0 ? 1 : 0}</span>
            <span className="text-sm text-muted-foreground block">DAY STREAK</span>
          </div> */}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calories</CardTitle>
              <p className="text-sm text-muted-foreground">Remaining = Goal - Food + Exercise</p>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="flex-1">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">{remaining.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories Remaining</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      Food
                    </span>
                    <span className="text-sm">{totals.calories}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Exercise
                    </span>
                    <span className="text-sm ml-4">0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{totals.carbs}</div>
                  <div className="text-xs text-muted-foreground">/{goals.carbs} g</div>
                  <span className="text-sm text-emerald-500 font-medium">Carbs</span>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{totals.fats}</div>
                  <div className="text-xs text-muted-foreground">/{goals.fats} g</div>
                  <span className="text-sm text-purple-500 font-medium">Fat</span>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{totals.protein}</div>
                  <div className="text-xs text-muted-foreground">/{goals.protein} g</div>
                  <span className="text-sm text-amber-500 font-medium">Protein</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New weekly stacked bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Calories & Macros</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading weekly data..." : "Bars show macro breakdown by day"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs">Carbs (50%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs">Fat (20%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">Protein (30%)</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day, idx) => {
                  const dateStr = day.toISOString().split("T")[0]
                  const dayData = weeklyData.find((d) => d.date.includes(dateStr)) || {
                    date: dateStr,
                    calories: 0,
                    carbs: 0,
                    fats: 0,
                    protein: 0,
                    sodium: 0,
                    sugar: 0,
                    fiber: 0,
                  }

                  const isToday = new Date().toISOString().split("T")[0] === dateStr

                  // 1) Calculate total bar height as a percentage of the calorie goal
                  // Don't cap at 100% so we can show when user exceeds their goal
                  const totalBarHeight = (dayData.calories / calorieGoal) * 100

                  // 2) Work out the ratio of each macro to the total calories
                  const carbCalories = dayData.carbs * 4
                  const proteinCalories = dayData.protein * 4
                  const fatCalories = dayData.fats * 9
                  const sumOfMacroCals = carbCalories + proteinCalories + fatCalories

                  // Calculate the heights based on the proportion of each macro
                  // If there are no calories, all heights will be 0
                  let carbHeight = 0, proteinHeight = 0, fatHeight = 0, leftoverHeight = 0

                  if (sumOfMacroCals > 0) {
                    // Calculate each macro's contribution to the total bar height
                    carbHeight = (carbCalories / sumOfMacroCals) * totalBarHeight
                    proteinHeight = (proteinCalories / sumOfMacroCals) * totalBarHeight
                    fatHeight = (fatCalories / sumOfMacroCals) * totalBarHeight

                    // Account for any discrepancy between tracked macros and total calories
                    const leftoverCalories = Math.max(0, dayData.calories - (sumOfMacroCals / 4))
                    if (leftoverCalories > 0 && dayData.calories > 0) {
                      leftoverHeight = (leftoverCalories / dayData.calories) * totalBarHeight
                    }
                  }

                  // Add this debugging log to see values
                  console.log(`Day: ${dayLabels[idx]}, Calories: ${dayData.calories}, Total Bar Height: ${totalBarHeight}, Carbs: ${carbHeight}, Protein: ${proteinHeight}, Fat: ${fatHeight}`)

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="text-xs font-medium mb-1">{dayLabels[idx]}</div>

                      <div
                        className={`w-full h-32 bg-gray-100 dark:bg-gray-800 rounded relative overflow-visible ${
                          isToday ? "border-2 border-primary" : ""
                        }`}
                      >
                        {/* Goal line at 50% height (representing 100% of daily goal) */}
                        <div className="absolute w-full h-[2px] bg-red-500 z-10" style={{ top: "50%" }}></div>

                        {/* Stacked bar */}
                        <div className="absolute bottom-0 w-full flex flex-col-reverse">
                          {/* Protein bar */}
                          <div
                            className="w-full bg-amber-500"
                            style={{
                              height: `${(proteinHeight / 100) * 64}px`, // 64px = half of 128px (h-32)
                              minHeight: proteinHeight > 0 ? "1px" : "0",
                            }}
                          ></div>

                          {/* Fat bar */}
                          <div
                            className="w-full bg-purple-500"
                            style={{
                              height: `${(fatHeight / 100) * 64}px`, // 64px = half of 128px (h-32)
                              minHeight: fatHeight > 0 ? "1px" : "0",
                            }}
                          ></div>

                          {/* Carbs bar */}
                          <div
                            className="w-full bg-emerald-500"
                            style={{
                              height: `${(carbHeight / 100) * 64}px`, // 64px = half of 128px (h-32)
                              minHeight: carbHeight > 0 ? "1px" : "0",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-xs mt-1 text-center">{dayData.calories}</div>

                      {/* Add the daily deficit/surplus indicator */}
                      <div className={`text-xs text-center ${
                        dayData.calories <= calorieGoal ? "text-green-500" : "text-red-500"
                      }`}>
                        {dayData.calories <= calorieGoal 
                          ? `-${(calorieGoal - dayData.calories).toLocaleString()}`
                          : `+${(dayData.calories - calorieGoal).toLocaleString()}`
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Weekly total display with educational text */}
              <div className="text-center mt-4 space-y-1">
                <div className="text-sm font-medium">
                  Weekly total: {weeklyTotalCalories.toLocaleString()} calories
                </div>
                <div className="text-xs text-muted-foreground">
                  A 3,500 calorie deficit = ~1lb fat loss, 7,000 calorie deficit = ~2lbs
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Heart Healthy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Fat</span>
                <span className="font-medium">
                  {totals.fats}/{goals.fats}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sodium</span>
                <span className="font-medium">
                  {totals.sodium}/{goals.sodium}mg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cholesterol</span>
                <span className="font-medium">
                  {totals.sugar}/{goals.sugar}g
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Carb</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Net Carbs</span>
                <span className="font-medium">
                  {totals.carbs - totals.fiber}/{goals.carbs}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sugar</span>
                <span className="font-medium">
                  {totals.sugar}/{goals.sugar}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fiber</span>
                <span className="font-medium">
                  {totals.fiber}/{goals.fiber}g
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="#" className="text-blue-500 hover:underline block mb-4">
                Change Nutrients
              </Link>
              <div className="flex justify-between items-center">
                <span>Carbohydrates</span>
                <span className="font-medium">
                  {totals.carbs}/{goals.carbs}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fat</span>
                <span className="font-medium">
                  {totals.fats}/{goals.fats}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Protein</span>
                <span className="font-medium">
                  {totals.protein}/{goals.protein}g
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Dashboard

