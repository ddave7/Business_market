"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundClient() {
  // Safely use client-side hooks
  const searchParams = useSearchParams()
  const path = searchParams?.get("path") || ""

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-2">The page you're looking for doesn't exist or has been moved.</p>
      {path && (
        <p className="text-md text-muted-foreground mb-8">
          Path: <code className="bg-muted px-1 py-0.5 rounded">{path}</code>
        </p>
      )}
      <div className="flex gap-4">
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    </div>
  )
}
