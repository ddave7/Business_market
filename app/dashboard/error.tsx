"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import ClientFallback from "./client-fallback"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Dashboard Error</AlertTitle>
        <AlertDescription>
          {error.message || "An error occurred while loading your dashboard."}
          {error.digest && <div className="mt-2 text-xs">Error ID: {error.digest}</div>}
        </AlertDescription>
      </Alert>

      <div className="flex gap-4 justify-center mb-8">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
        <Button onClick={() => router.push("/login")} variant="outline">
          Go to Login
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Client Fallback</h2>
        <ClientFallback />
      </div>
    </div>
  )
}
