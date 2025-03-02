"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LogoSvg from "@/public/Phone Eats First.svg"

export function AuthHeader() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (session) {
      router.push('/')
    } else {
      router.push('/auth/signin')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 ml-2"
        >
          <Image
            src={LogoSvg}
            alt="Phone Eats First Logo"
            className="h-16 w-auto"
          />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}