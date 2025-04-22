import { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const ProductCard = memo(function ProductCard({ product }: { product: any }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-2">by {product.business.businessName}</p>
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
})

export default ProductCard
