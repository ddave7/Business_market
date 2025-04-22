"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ClientLogin from "./client-login"

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Login page error:", error)
  }, [error])

  return (
    <div className="max-w-md mx-auto p-4">
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error Loading Login</AlertTitle>
        <AlertDescription>
          {error.message || "An error occurred while loading the login page."}
          {error.digest && <div className="mt-2 text-xs">Error ID: {error.digest}</div>}
        </AlertDescription>
      </Alert>

      <div className="flex justify-center mb-8">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Client Fallback</h2>
        <ClientLogin />
      </div>
    </div>
  )
}
