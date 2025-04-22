"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import DollarTransferAnimation from "./components/DollarTransferAnimation"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  const handleReset = async () => {
    setIsResetting(true)
    // Add a small delay to show the animation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    reset()
    setIsResetting(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <Alert variant="destructive" className="max-w-md mb-6">
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>
          {error.message || "An unexpected error occurred"}
          {error.digest && <div className="mt-2 text-xs">Error ID: {error.digest}</div>}
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        {isResetting ? (
          <div className="min-w-[100px] flex justify-center">
            <DollarTransferAnimation size="small" message="Retrying..." />
          </div>
        ) : (
          <Button onClick={handleReset} variant="default">
            Try again
          </Button>
        )}
        <Button onClick={() => router.push("/products")} variant="outline">
          Return to Products
        </Button>
      </div>
    </div>
  )
}
