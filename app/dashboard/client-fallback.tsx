"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DollarTransferAnimation from "../components/DollarTransferAnimation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardClientFallback() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        // First check if user is authenticated
        const authRes = await fetch("/api/auth/check", {
          credentials: "include",
          cache: "no-store",
        })

        const authData = await authRes.json()

        if (!authData.authenticated) {
          console.log("Not authenticated, redirecting to login")
          router.push("/login?from=/dashboard")
          return
        }

        // Try to get user info directly from the check endpoint if available
        if (authData.user) {
          setUser(authData.user)
        } else {
          // Otherwise fetch from the me endpoint
          const userRes = await fetch("/api/auth/me", {
            credentials: "include",
            cache: "no-store",
          })

          if (!userRes.ok) {
            console.error("Failed to fetch user data:", userRes.status, userRes.statusText)
            if (userRes.status === 401) {
              router.push("/login?from=/dashboard")
              return
            }
            throw new Error(`Failed to fetch user data: ${userRes.status}`)
          }

          const userData = await userRes.json()
          setUser(userData)
        }

        // Get products
        const productsRes = await fetch("/api/products-client?my=true", {
          credentials: "include",
          cache: "no-store",
        })

        if (!productsRes.ok) {
          console.error("Failed to fetch products:", productsRes.status, productsRes.statusText)
          throw new Error(`Failed to fetch products: ${productsRes.status}`)
        }

        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      } catch (err) {
        console.error("Error in client fallback:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <DollarTransferAnimation message="Loading your dashboard..." size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}. Please try refreshing the page or logging in again.</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>You need to be logged in to view this page.</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

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
                <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
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
