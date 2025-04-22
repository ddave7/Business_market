"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Products page error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Error Loading Products</AlertTitle>
        <AlertDescription>
          {error.message || "An unexpected error occurred while loading products."}
          {error.digest && <div className="mt-2 text-xs">Error ID: {error.digest}</div>}
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
        <Link href="/products/client">
          <Button variant="outline">Use Alternative View</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>

      <div className="bg-gray-100 p-4 rounded-md text-sm mt-8">
        <h3 className="font-bold mb-2">Troubleshooting:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Check your internet connection</li>
          <li>Ensure you're logged in (some features require authentication)</li>
          <li>Try clearing your browser cache</li>
          <li>If the problem persists, please contact support</li>
        </ul>
      </div>
    </div>
  )
}
