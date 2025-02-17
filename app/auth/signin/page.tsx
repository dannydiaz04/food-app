"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      console.log('Attempting to sign in with:', {
        email: credentials.email,
        password: credentials.password
      })

      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
        callbackUrl: '/'
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError("An error occurred during sign in")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 text-gray-100 border-green-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-green-400">Sign In to Food Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-400">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="bg-gray-800 border-green-600 text-gray-100 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-400">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="bg-gray-800 border-green-600 text-gray-100 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-green-400 hover:text-green-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors">
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-400">Don&apos;t have an account?</p>
            <Link href="/auth/signup" className="text-green-400 hover:text-green-300">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}