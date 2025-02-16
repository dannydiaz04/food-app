import Link from "next/link"
import { Home, UtensilsCrossed, Settings } from "lucide-react"

export function Navigation() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <UtensilsCrossed className="h-6 w-6 text-emerald-500" />
            <span className="text-lg font-bold">NutriTrack</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/food-diary" 
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>Food Diary</span>
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 