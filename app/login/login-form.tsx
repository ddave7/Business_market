"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingOverlay from "@/app/components/LoadingOverlay"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [forceAnimation, setForceAnimation] = useState(false)

  // Get the 'from' parameter safely with useSearchParams
  const fromPath = searchParams.get("from") || "/dashboard"

  // If forceAnimation is true, show the animation for 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (forceAnimation) {
      timer = setTimeout(() => {
        setForceAnimation(false)
      }, 3000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [forceAnimation])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    setForceAnimation(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("Sending login request")

      const minimumDisplayTime = new Promise((resolve) => setTimeout(resolve, 1500))

      const loginPromise = fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
        cache: "no-store",
      })

      const [res] = await Promise.all([loginPromise, minimumDisplayTime])

      if (!res.ok) {
        const data = await res.json()
        console.error("Login response error:", data)
        throw new Error(data.error || "Error logging in")
      }

      const data = await res.json()
      console.log("Login response received:", data)

      // Add a small delay before redirecting to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("Login successful, redirecting")
      router.push(fromPath)
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Error logging in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login to Your Account</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <LoadingOverlay isLoading={loading || forceAnimation} message="Logging you in...">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading || forceAnimation}>
            {loading || forceAnimation ? "Logging in..." : "Login"}
          </Button>
        </form>
      </LoadingOverlay>

      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register here
        </Link>
      </p>
    </div>
  )
}
