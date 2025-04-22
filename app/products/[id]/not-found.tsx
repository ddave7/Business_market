import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
      <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
      <Link href="/products">
        <Button>Browse All Products</Button>
      </Link>
    </div>
  )
}
