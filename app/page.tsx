"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function FoodDiary() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 p-4 border-b border-green-500">
        <div className="max-w-7xl mx-auto flex space-x-8">
          <Link href="/" className="text-green-400 hover:text-green-300">
            Food Diary
          </Link>
          <Link href="/database" className="text-green-400 hover:text-green-300">
            Database
          </Link>
          <Link href="/my-foods" className="text-green-400 hover:text-green-300">
            My Foods
          </Link>
          <Link href="/my-meals" className="text-green-400 hover:text-green-300">
            My Meals
          </Link>
          <Link href="/recipes" className="text-green-400 hover:text-green-300">
            Recipes
          </Link>
          <Link href="/settings" className="text-green-400 hover:text-green-300">
            Settings
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Date Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-green-400">Your Food Diary For:</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() - 1)
                setCurrentDate(newDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-white">{formatDate(currentDate)}</span>
            <Button
              variant="outline"
              size="icon"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() + 1)
                setCurrentDate(newDate)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <input
              type="date"
              value={currentDate.toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value)
                // Adjust for timezone offset
                newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset())
                setCurrentDate(newDate)
              }}
              className="sr-only peer"
              id="date-picker"
            />
            <Button
              variant="outline"
              size="icon"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
              onClick={() => {
                document.getElementById("date-picker")?.click()
              }}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Meal Sections */}
        {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
          <div key={meal} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-green-400">{meal}</h3>
              <div className="space-x-4">
                <Link href={`/add-food/${meal.toLowerCase()}`} className="text-green-400 hover:text-green-300">
                  Add Food
                </Link>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="link" className="text-green-400 hover:text-green-300">
                      Quick Tools
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-gray-800 border-green-500">
                    <div className="grid gap-4">
                      <Link href="/add-food/macro-calculator" className="text-green-400 hover:text-green-300 text-sm">
                        Macro Calculator
                      </Link>
                      {/* Add more quick tools here as needed */}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-4 text-center bg-gray-800 p-3 rounded-lg text-sm">
              <div>
                Calories
                <br />
                kcal
              </div>
              <div>
                Carbs
                <br />g
              </div>
              <div>
                Fat
                <br />g
              </div>
              <div>
                Protein
                <br />g
              </div>
              <div>
                Sodium
                <br />
                mg
              </div>
              <div>
                Sugar
                <br />g
              </div>
              <div></div>
            </div>
          </div>
        ))}

        {/* Totals */}
        <div className="mt-8 space-y-2">
          <div className="grid grid-cols-7 gap-4 text-center">
            <div>0</div>
            <div>0</div>
            <div>0</div>
            <div>0</div>
            <div>0</div>
            <div>0</div>
            <div></div>
          </div>
          <div className="grid grid-cols-7 gap-4 text-center text-green-400">
            <div>2,033</div>
            <div>202</div>
            <div>45</div>
            <div>205</div>
            <div>2,300</div>
            <div>76</div>
            <div>Daily Goal</div>
          </div>
          <div className="grid grid-cols-7 gap-4 text-center text-green-400">
            <div>2,033</div>
            <div>202</div>
            <div>45</div>
            <div>205</div>
            <div>2,300</div>
            <div>76</div>
            <div>Remaining</div>
          </div>
        </div>

        {/* Complete Entry Button */}
        <div className="mt-8 text-center">
          <Button className="bg-green-500 text-white hover:bg-green-600">Complete This Entry</Button>
        </div>
      </main>
    </div>
  )
}

