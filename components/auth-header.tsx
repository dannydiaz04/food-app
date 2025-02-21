"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="text-green-400 hover:text-green-300 text-xl font-bold">
          Food Tracker
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
} 