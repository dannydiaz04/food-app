"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { MacroCalculator } from "@/components/macro-calculator"

export default function MacroCalculatorClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || "breakfast"
  const date = searchParams.get("date")

  const handleClose = () => {
    // Go back to previous page instead of directly to flavor-journal
    router.back()
  }

  return (
    <MacroCalculator 
      meal={meal} 
      isOpen={true} 
      onClose={handleClose}
      isPage={true}
      initialDate={date || undefined}
    />
  )
}