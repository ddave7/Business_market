"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProductImage from "./ProductImage"

export default function ProductCard({ product }: { product: any }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="p-0 pt-4 px-4">
        <div className="w-full h-48 mb-4 relative bg-gray-100 rounded-md overflow-hidden">
          <ProductImage
            src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-2">by {product.business?.businessName || "Unknown Business"}</p>
        <p className="line-clamp-2 text-sm mb-2">{product.description}</p>
        <p className="font-bold">${product.price.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">Stock: {product.stock} units</p>
      </CardContent>
      <CardFooter>
        <Link href={`/products/${product._id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
