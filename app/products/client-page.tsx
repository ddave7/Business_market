"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClientProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/products")

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setProducts(data.products)
        setTotalPages(data.totalPages)
        setCurrentPage(data.currentPage)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(error instanceof Error ? error.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          An error occurred while fetching products. Please try again later.
          <br />
          Error details: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Products (Client-side)</h1>

      <div className="mb-6">
        <form className="flex flex-wrap gap-4">
          <Input type="text" name="search" placeholder="Search products..." className="flex-grow" />
          <Input type="number" name="minPrice" placeholder="Min Price" />
          <Input type="number" name="maxPrice" placeholder="Max Price" />
          <select name="category" className="border rounded px-2 py-1">
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food & Beverages">Food & Beverages</option>
            <option value="Home & Garden">Home & Garden</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Other">Other</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
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
  )
}
