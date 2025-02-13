"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { format } from "date-fns"

export default function FoodDiary() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Food Diary" },
    { href: "/database", label: "Database" },
    { href: "/my-foods", label: "My Foods" },
    { href: "/my-meals", label: "My Meals" },
    { href: "/recipes", label: "Recipes" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 p-4 border-b border-green-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-green-400 hover:text-green-300 text-xl font-bold">
            Food Tracker
          </Link>
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-green-400 hover:text-green-300">
                {item.label}
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-green-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-green-400 hover:text-green-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Date Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <h2 className="text-green-400 text-lg sm:text-xl">Your Food Diary For:</h2>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white justify-start text-left font-normal text-sm sm:text-base"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(currentDate, "EEEE, PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-green-500">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                  className="bg-gray-800 text-white"
                />
              </PopoverContent>
            </Popover>
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
          </div>
        </div>

        {/* Meal Sections */}
        {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
          <div key={meal} className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl text-green-400 mb-2 sm:mb-0">{meal}</h3>
              <div className="flex justify-between items-center">
                <Link
                  href={`/add-food/${meal.toLowerCase()}`}
                  className="text-green-400 hover:text-green-300 text-sm sm:text-base"
                >
                  Add Food
                </Link>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="link"
                      className="text-green-400 hover:text-green-300 text-sm sm:text-base p-0 ml-4"
                    >
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
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 text-center bg-gray-800 p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
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
              <div className="hidden sm:block">
                Protein
                <br />g
              </div>
              <div className="hidden sm:block">
                Sodium
                <br />
                mg
              </div>
              <div className="hidden sm:block">
                Sugar
                <br />g
              </div>
              <div className="hidden sm:block"></div>
            </div>
          </div>
        ))}

        {/* Totals */}
        <div className="mt-8 space-y-2">
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
            <div>0</div>
            <div>0</div>
            <div>0</div>
            <div className="hidden sm:block">0</div>
            <div className="hidden sm:block">0</div>
            <div className="hidden sm:block">0</div>
            <div className="hidden sm:block"></div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 text-center text-green-400 text-xs sm:text-sm">
            <div>2,033</div>
            <div>202</div>
            <div>45</div>
            <div className="hidden sm:block">205</div>
            <div className="hidden sm:block">2,300</div>
            <div className="hidden sm:block">76</div>
            <div className="hidden sm:block">Daily Goal</div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 text-center text-green-400 text-xs sm:text-sm">
            <div>2,033</div>
            <div>202</div>
            <div>45</div>
            <div className="hidden sm:block">205</div>
            <div className="hidden sm:block">2,300</div>
            <div className="hidden sm:block">76</div>
            <div className="hidden sm:block">Remaining</div>
          </div>
        </div>

        {/* Complete Entry Button */}
        <div className="mt-8 text-center">
          <Button className="bg-green-500 text-white hover:bg-green-600 text-sm sm:text-base">
            Complete This Entry
          </Button>
        </div>
      </main>
    </div>
  )
}

