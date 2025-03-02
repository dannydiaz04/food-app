"use client"

import { useState, useEffect } from "react"
import { Menu, X, Home, Database, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from 'next/navigation'
import Image from "next/image"
import LogoSvg from "@/public/Phone Eats First.svg"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Effect to detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10; // Detect if scrolled more than 10px
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Desktop nav items remain the same
  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/database", label: "Database", icon: <Database className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Mobile nav items have been updated
  const mobileNavItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/flavor-journal", label: "Add", icon: <Plus className="h-5 w-5" /> },
    { 
      label: "Menu", 
      icon: <Menu className="h-5 w-5" />, 
      action: () => setMobileMenuOpen(true) 
    },
  ]

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="bg-background border-b p-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-xl font-bold">
            <Image 
              src={LogoSvg} 
              alt="Phone Eats First Logo" 
              className={`h-24 w-auto transition-opacity duration-200 ${scrolled ? 'opacity-30' : 'opacity-100'}`} 
            />
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
            <Link href="/flavor-journal" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              Flavor Journal
            </Link>
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
        <div className="h-16"></div>
        
        {/* Logo in the upper-left corner for mobile */}
        <div className="fixed top-4 left-4 z-50">
          <Link href="/">
            <Image 
              src={LogoSvg} 
              alt="Phone Eats First Logo" 
              className={`h-20 w-auto transition-opacity duration-200 ${scrolled ? 'opacity-0' : 'opacity-100'}`} 
            />
          </Link>
        </div>
        
        {/* Theme toggle for mobile - positioned at top right */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
          <div className="flex justify-around items-center p-3">
            {mobileNavItems.map((item, index) => {
              const isActive = item.href ? (pathname === item.href || 
                (item.href !== "/" && pathname?.startsWith(item.href))) : false;
              
              // For the menu button (which has no href)
              if (item.action) {
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`flex flex-col items-center justify-center ${
                      mobileMenuOpen 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="mb-1">{item.icon}</div>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              }
              
              // For regular nav links
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

      {/* Mobile expanded menu (when ghost menu is clicked) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-50 p-4 md:hidden flex flex-col h-full">
          {/* Header */}
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
          
          {/* Spacer to push all content to the bottom */}
          <div className="flex-grow"></div>
          
          {/* Navigation links and sign out positioned at bottom right */}
          <div className="self-end mt-auto space-y-4 text-green-600 dark:text-green-400">
            {/* Database link */}
            <Link 
              href="/database" 
              className="flex items-center justify-end space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Database</span>
              <Database className="h-5 w-5" />
            </Link>
            
            {/* Settings link */}
            <Link 
              href="/settings" 
              className="flex items-center justify-end space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Settings</span>
              <Settings className="h-5 w-5" />
            </Link>
            
            {/* Sign Out button */}
            <div className="flex justify-end pt-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  )
}