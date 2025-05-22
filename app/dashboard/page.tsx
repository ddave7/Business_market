import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"
import { Suspense } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import Order from "@/models/Order"

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

async function getRecentOrders() {
  await connectDB()
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return { orders: [] }
  }

  const user = await getUserFromToken({ headers: { cookie: `auth_token=${token}` } } as Request)

  if (!user) {
    return { orders: [] }
  }

  try {
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean()

    return { orders: JSON.parse(JSON.stringify(orders)) }
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return { orders: [] }
  }
}

function DashboardContent({ user, products, orders }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.businessName}</h1>
        <Link href="/products/add">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Products</h2>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
              <Link href="/products/add">
                <Button>Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.slice(0, 3).map((product: any) => (
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
              {products.length > 3 && (
                <div className="text-center mt-2">
                  <Link href="/dashboard/products">
                    <Button variant="link">View All Products</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">You haven't received any orders yet.</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Order #{order._id.substring(order._id.length - 8)}</CardTitle>
                      <Badge variant={order.status === "delivered" ? "default" : "outline"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>{format(new Date(order.createdAt), "MMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      {order.items.length} items • ${order.total.toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/orders/${order._id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        View Order
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              <div className="text-center mt-2">
                <Link href="/orders">
                  <Button variant="link">View All Orders</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  try {
    const { user, products } = await getBusinessProducts()
    const { orders } = await getRecentOrders()

    return (
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <DollarTransferAnimation message="Loading your dashboard..." size="large" />
          </div>
        }
      >
        <DashboardContent user={user} products={products} orders={orders} />
      </Suspense>
    )
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          An error occurred while fetching your data. Please try again later or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    )
  }
}
