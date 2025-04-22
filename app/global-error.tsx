"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
            <p className="mb-4">We're sorry, but there was an unexpected error. Our team has been notified.</p>
            {error.digest && <p className="text-sm text-gray-500 mb-4">Error ID: {error.digest}</p>}
            <Button onClick={() => reset()} className="w-full">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
