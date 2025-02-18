"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { MacroCalculator } from "@/components/macro-calculator"

export default function MacroCalculatorClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || "breakfast"

  const handleClose = () => {
    router.push("/food-diary")
  }

  return (
    <MacroCalculator 
      meal={meal} 
      isOpen={true} 
      onClose={handleClose}
      isPage={true}
    />
  )
} 