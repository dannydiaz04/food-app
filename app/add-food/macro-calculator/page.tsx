import { Suspense } from "react"
import MacroCalculatorClient from "./macro-calculator-client"
import { Navigation } from "@/components/navigation"

export default function MacroCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={<div>Loading...</div>}>
        <MacroCalculatorClient />
      </Suspense>
    </div>
  )
}

