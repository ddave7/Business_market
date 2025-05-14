"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export default function NotFoundClient() {
  // This is now safely wrapped in a client component that will be wrapped in Suspense
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || ""

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {from
          ? `The page "${from}" doesn't exist or has been moved.`
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
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
