"use client"

import { Suspense } from "react"
import { MacroCalculatorWrapper } from "./macro-calculator-wrapper"

export default function MacroCalculatorPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          Loading...
        </div>
      }
    >
      <MacroCalculatorWrapper />
    </Suspense>
  )
}

