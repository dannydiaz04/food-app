"use client"

import { useState } from "react"
import { Menu, X, Home, Database, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from 'next/navigation'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/flavor-journal", label: "Journal", icon: <User className="h-5 w-5" /> },
    { href: "/database", label: "Database", icon: <Database className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="bg-background border-b p-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-xl font-bold">
            Flavor 
            <span className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">Journal</span>
          </Link>
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
              >
                {item.label}
              </Link>
            ))}
            <div className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              <SignOutButton />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <div className="block md:hidden">
        {/* Extra space at the top to compensate for the fixed navigation */}
        <div className="h-4"></div>
        
        {/* Theme toggle for mobile - positioned at top right */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
          <div className="flex justify-around items-center p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center ${
                    isActive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* Add bottom padding to content to prevent it being hidden behind the fixed navigation */}
        <div className="pb-20"></div>
      </div>

      {/* Mobile expanded menu (if needed) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-50 p-4 md:hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X />
            </Button>
          </div>
          
          <div className="space-y-4">
            <SignOutButton />
          </div>
        </div>
      )}
    </>
  )
}