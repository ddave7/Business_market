import { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AddToCartButton from "./AddToCartButton"

type Product = {
  _id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number
  business: {
    businessName: string
  }
}

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
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
      <CardFooter className="flex gap-2">
        <Link href={`/products/${product._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        <div className="flex-1">
          <AddToCartButton product={product} className="w-full" />
        </div>
      </CardFooter>
    </Card>
  )
})

const ProductList = memo(function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
})

export default ProductList
