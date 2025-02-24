"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/flavor-journal", label: "Flavor Journal" },
    { href: "/database", label: "Database" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <>
      <nav className="bg-background border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-green-400 hover:text-green-300 text-xl font-bold">
            Flavor 
            <div className="text-green-400 hover:text-green-300">Journal</div>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-green-400 hover:text-green-300">
                {item.label}
              </Link>
            ))}
            <div className="text-green-400 hover:text-green-300">
              <SignOutButton />
            </div>
            <ThemeToggle />
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-green-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background p-4">
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
          <div className="text-green-400 hover:text-green-300 py-2">
            <SignOutButton />
          </div>
        </div>
      )}
    </>
  )
} 