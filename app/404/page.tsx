import { Suspense } from "react"
import NotFoundClient from "./not-found-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import NotFoundLoading from "./loading"

// Fallback component that doesn't use useSearchParams
function NotFoundFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
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

export default function NotFoundPage() {
  return (
    <Suspense fallback={<NotFoundLoading />}>
      <NotFoundClient />
    </Suspense>
  )
}
