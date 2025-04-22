"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingOverlay from "@/app/components/LoadingOverlay"

export default function RegisterForm() {
  const router = useRouter()
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [forceAnimation, setForceAnimation] = useState(false)

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
    setErrors([])
    setLoading(true)
    setForceAnimation(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      businessName: formData.get("businessName"),
      email: formData.get("email"),
      password: formData.get("password"),
      description: formData.get("description"),
    }

    try {
      console.log("Sending registration request")

      const minimumDisplayTime = new Promise((resolve) => setTimeout(resolve, 3000))

      const registerPromise = fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const [res] = await Promise.all([registerPromise, minimumDisplayTime])

      const responseData = await res.json()
      console.log("Registration response:", responseData)

      if (!res.ok) {
        if (responseData.details) {
          setErrors(Array.isArray(responseData.details) ? responseData.details : [responseData.details])
        } else {
          setErrors([responseData.error || "Error registering"])
        }
        return
      }

      console.log("Registration successful, redirecting to login")
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      setErrors(["An unexpected error occurred. Please try again."])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Register Your Business</h1>

      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <LoadingOverlay isLoading={loading || forceAnimation} message="Creating your account...">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea id="description" name="description" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading || forceAnimation}>
            {loading || forceAnimation ? "Registering..." : "Register"}
          </Button>
        </form>
      </LoadingOverlay>

      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login here
        </Link>
      </p>
    </div>
  )
}
