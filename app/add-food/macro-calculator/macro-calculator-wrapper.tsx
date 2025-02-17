"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { MacroCalculator } from "@/components/macro-calculator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function MacroCalculatorWrapper() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || ""

  useEffect(() => {
    if (!meal) {
      router.push("/food-diary")
    }
  }, [meal, router])
  
  if (!meal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Redirecting...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto">
        <Link href="/food-diary">
          <Button variant="ghost" className="mb-4 text-green-400 hover:text-green-300 hover:bg-gray-800">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Food Diary
          </Button>
        </Link>

        <MacroCalculator 
          meal={meal}
          onClose={() => router.push("/food-diary")}
        />
      </div>
    </div>
  )
}
