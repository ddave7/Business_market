"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingDelay from "../components/LoadingDelay"

export default function ClientProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        // First, check API health
        const healthCheck = await fetch("/api/healthcheck")
        const healthData = await healthCheck.json()
        setDiagnosticInfo({
          apiHealth: healthData,
          timestamp: new Date().toISOString(),
        })

        if (healthData.status !== "ok") {
          throw new Error(`API health check failed: ${JSON.stringify(healthData)}`)
        }

        // Then fetch products
        const res = await fetch("/api/products-client")

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`API error (${res.status}): ${errorText}`)
        }

        const data = await res.json()
        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.currentPage || 1)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(error instanceof Error ? error.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            An error occurred while fetching products. Please try again later.
            <br />
            Error details: {error}
          </AlertDescription>
        </Alert>

        {diagnosticInfo && (
          <div className="bg-gray-100 p-4 rounded-md text-sm">
            <h3 className="font-bold mb-2">Diagnostic Information:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(diagnosticInfo, null, 2)}</pre>
          </div>
        )}

        <div className="text-center">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <LoadingDelay message="Loading products..." minimumLoadingTime={3000}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">All Products</h1>

        <div className="mb-6">
          <form className="flex flex-wrap gap-4">
            <Input type="text" name="search" placeholder="Search products..." className="flex-grow" />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <Card key={product._id} className="h-full flex flex-col">
                <CardHeader>
                  <div className="w-full h-48 mb-2 rounded-t-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl || "/placeholder.svg?height=400&width=400"}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2">by {product.business?.businessName || "Unknown"}</p>
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
            ))}
          </div>
        )}

        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              className={page === currentPage ? "bg-primary text-primary-foreground" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      </div>
    </LoadingDelay>
  )
}
