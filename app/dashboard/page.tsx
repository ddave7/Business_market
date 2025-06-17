import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"
import { Suspense } from "react"

async function getBusinessProducts() {
  await connectDB()
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    console.error("Dashboard: No auth token found, redirecting to login")
    redirect("/login")
  }

  const user = await getUserFromToken({ headers: { cookie: `auth_token=${token}` } } as Request)

  if (!user) {
    console.error("Dashboard: No user found, redirecting to login")
    redirect("/login")
  }

  try {
    const products = await Product.find({ business: user._id }).sort({ createdAt: -1 }).limit(10).lean()

    console.log("Dashboard: Products fetched:", products.length)
    return { user, products: JSON.parse(JSON.stringify(products)) }
  } catch (error) {
    console.error("Error fetching business products:", error)
    throw new Error("Failed to fetch business products")
  }
}

function DashboardContent({ user, products }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.businessName}</h1>
        <Link href="/products/add">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Your Products</h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
          <Link href="/products/add">
            <Button>Add Your First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Card key={product._id} className="flex flex-col">
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
                <p className="line-clamp-2 text-sm mb-2">{product.description}</p>
                <p className="font-bold">${product.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Stock: {product.stock} units</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/products/${product._id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Link href={`/products/${product._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  try {
    const { user, products } = await getBusinessProducts()

    return (
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <DollarTransferAnimation message="Loading your dashboard..." size="large" />
          </div>
        }
      >
        <DashboardContent user={user} products={products} />
      </Suspense>
    )
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          An error occurred while fetching your products. Please try again later or contact support if the problem
          persists.
        </AlertDescription>
      </Alert>
    )
  }
}
