import { notFound } from "next/navigation"
import Image from "next/image"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { retry } from "@/lib/utils"
import { Suspense } from "react"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"
import AddToCartButton from "@/app/components/AddToCartButton"

async function getProduct(id: string) {
  try {
    await connectDB()

    // Use the retry utility for better resilience
    const product = await retry(async () => {
      const result = await Product.findById(id).populate("business", "businessName").lean()
      if (!result) {
        notFound()
      }
      return JSON.parse(JSON.stringify(result))
    }, 3)

    return product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function ProductDetail({ product }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.imageUrl || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">${product.price.toFixed(2)}</p>
          <p className="mb-4">{product.description}</p>
          <p className="mb-4">Category: {product.category}</p>
          <p className="mb-4">Stock: {product.stock} units</p>
          <p className="mb-4">Seller: {product.business.businessName}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return (
        <Alert variant="destructive">
          <AlertDescription>Please log in to view this product.</AlertDescription>
        </Alert>
      )
    }

    const user = await getUserFromToken({ headers: { cookie: `auth_token=${token}` } } as Request)

    if (!user) {
      return (
        <Alert variant="destructive">
          <AlertDescription>Please log in to view this product.</AlertDescription>
        </Alert>
      )
    }

    const product = await getProduct(params.id)

    return (
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <DollarTransferAnimation message="Loading product details..." size="large" />
          </div>
        }
      >
        <ProductDetail product={product} />
      </Suspense>
    )
  } catch (error) {
    console.error("Error in ProductPage:", error)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          An error occurred while fetching the product. Please try again later.
          <br />
          Error details: {error instanceof Error ? error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    )
  }
}
