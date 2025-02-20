"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

export default function AddFood() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-green-400 hover:text-green-300 hover:bg-gray-800">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Flavor Journal
          </Button>
        </Link>

        <Card className="bg-gray-900 text-white border-green-500">
          {/* Add your card content here */}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Add Food</h2>
            <p>This is where you can add food items to your journal.</p>
            {/* Add more components or functionality as needed */}
          </div>
        </Card>
      </div>
    </div>
  )
}

