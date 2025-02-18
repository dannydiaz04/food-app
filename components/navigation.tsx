"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/food-diary", label: "Food Diary" },
    { href: "/database", label: "Database" },
    { href: "/my-foods", label: "My Foods" },
    { href: "/my-meals", label: "My Meals" },
    { href: "/recipes", label: "Recipes" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <>
      <nav className="bg-gray-900 p-4 border-b border-green-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-green-400 hover:text-green-300 text-xl font-bold">
            Food Tracker
          </Link>
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-green-400 hover:text-green-300">
                {item.label}
              </Link>
            ))}
            <div className="text-green-400 hover:text-green-300">
              <SignOutButton />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-green-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-green-400 hover:text-green-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="text-green-400 hover:text-green-300">
            <SignOutButton />
          </div>
        </div>
      )}
    </>
  )
} 