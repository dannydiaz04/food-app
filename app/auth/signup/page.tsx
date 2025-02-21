"use client"

import type React from "react"
import Link from "next/link"
import { AuthHeader } from "@/components/auth-header"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <>
      <AuthHeader />
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-green-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            {/* <Link href="/" className="text-green-400 hover:text-green-300">Food Tracker</Link> */}
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Join us to start your nutrition tracking journey.
              </p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] mt-16 lg:mt-0">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <SignUpForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              <Link
                href="/auth/signin"
                className="hover:text-brand underline underline-offset-4"
              >
                Already have an account? Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

