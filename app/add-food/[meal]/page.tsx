"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface FoodItem {
  id: string
  name: string
  defaultQty: number
  defaultUnit: string
  checked: boolean
}

export default function AddFood({ params }: { params: { meal: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      id: "1",
      name: "Kellogg's - Rice Krispies Treats, Original",
      defaultQty: 1,
      defaultUnit: "bar",
      checked: false,
    },
    {
      id: "2",
      name: "Starbucks Coffee Company - Double Shot Energy Coffee Drink, Vanilla",
      defaultQty: 1,
      defaultUnit: "can",
      checked: false,
    },
    {
      id: "3",
      name: "365 Everyday Value - White Hot Dog Buns",
      defaultQty: 2,
      defaultUnit: "bun",
      checked: false,
    },
    {
      id: "4",
      name: "Field Roast - Sausages, Italian Garlic & Fennel, Plant-Based",
      defaultQty: 2,
      defaultUnit: "sausage",
      checked: false,
    },
  ])

  const handleCheckItem = (id: string) => {
    setFoodItems(foodItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const handleAddChecked = () => {
    // Handle adding checked items
    const checkedItems = foodItems.filter((item) => item.checked)
    console.log("Adding items:", checkedItems)
  }

  const handleDeleteFromList = () => {
    setFoodItems(foodItems.filter((item) => !item.checked))
  }

  const handleDeleteItem = (id: string) => {
    setFoodItems(foodItems.filter((item) => item.id !== id))
  }

  const capitalizedMeal = params.meal.charAt(0).toUpperCase() + params.meal.slice(1)

  return (
    <div className="min-h-screen bg-black text-white">
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
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-green-400 hover:text-green-300 hover:bg-gray-800">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Food Diary
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-green-400">Add Food To {capitalizedMeal}</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-green-400">Search our food database by name</h2>
              <Link href="/quick-add" className="text-green-400 hover:text-green-300 text-sm">
                Quick add calories
              </Link>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-gray-800 border-green-500 text-white"
              />
              <Button className="bg-green-500 hover:bg-green-600">Search</Button>
            </div>
          </div>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="bg-gray-800 border-b border-green-500">
              <TabsTrigger
                value="recent"
                className="text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                RECENT
              </TabsTrigger>
              <TabsTrigger
                value="frequent"
                className="text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                FREQUENT
              </TabsTrigger>
              <TabsTrigger
                value="my-foods"
                className="text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                MY FOODS
              </TabsTrigger>
              <TabsTrigger
                value="meals"
                className="text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                MEALS
              </TabsTrigger>
              <TabsTrigger
                value="recipes"
                className="text-green-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                RECIPES
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4">
              <div className="space-y-4">
                <Button onClick={handleAddChecked} className="bg-green-500 hover:bg-green-600">
                  Add Checked
                </Button>

                <div className="space-y-2">
                  {foodItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => handleCheckItem(item.id)}
                        className="border-green-500 data-[state=checked]:bg-green-500"
                      />
                      <span className="flex-1">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-400">Qty:</span>
                        <Input type="number" value={item.defaultQty} className="w-16 bg-gray-700 border-green-500" />
                        <span className="text-sm text-green-400">of</span>
                        <Select defaultValue={item.defaultUnit}>
                          <SelectTrigger className="w-32 bg-gray-700 border-green-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-green-500">
                            <SelectItem value={item.defaultUnit}>{item.defaultUnit}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          DELETE
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button onClick={handleAddChecked} className="bg-green-500 hover:bg-green-600">
                    Add Checked
                  </Button>
                  <div className="space-x-2">
                    <Button
                      onClick={handleDeleteFromList}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      DELETE FROM LIST
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    >
                      View Deleted Items
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="frequent">Frequent items will appear here.</TabsContent>
            <TabsContent value="my-foods">Your custom foods will appear here.</TabsContent>
            <TabsContent value="meals">Your saved meals will appear here.</TabsContent>
            <TabsContent value="recipes">Your recipes will appear here.</TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

