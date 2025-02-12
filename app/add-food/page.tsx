"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

// ... (previous MacroCalculator component code remains the same until return statement)

return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto">
        <Link href="/">
          <Button 
            variant="ghost" 
            className="mb-4 text-green-400 hover:text-green-300 hover:bg-gray-800"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Food Diary
          </Button>
        </Link>
        
        <Card className="bg-gray-900 text-white border-green-500">
          {/* ... (rest of the card content remains the same) ... */}
        </Card>
      </div>
    </div>
  )
}