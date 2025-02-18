"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { MacroCalculator } from "@/components/macro-calculator"

export default function MacroCalculatorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || "breakfast"

  const handleClose = () => {
    router.push("/food-diary")  // Navigate back to food diary when closed
  }

  return (
    <div className="min-h-screen bg-background">
      <MacroCalculator 
        meal={meal} 
        isOpen={true} 
        onClose={handleClose}
        isPage={true}  // New prop to indicate this is a page render
      />
    </div>
  )
}

