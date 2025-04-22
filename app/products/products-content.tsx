"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProductList from "@/components/ProductList"
import DollarTransferAnimation from "../components/DollarTransferAnimation"
import { useSearchParams, useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import ProductFilters, { type ProductFilters as FilterType } from "../components/ProductFilters"
import { Filter, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Get search and filter params from URL
  const urlSearchTerm = searchParams.get("search") || ""
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Get current filters from URL
  const currentFilters: FilterType = {
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    inStock: searchParams.get("inStock") === "true",
    search: urlSearchTerm,
  }

  // Check if any filters are active
  const hasActiveFilters =
    currentFilters.category !== "" ||
    currentFilters.minPrice !== undefined ||
    currentFilters.maxPrice !== undefined ||
    currentFilters.inStock

  // Fetch products with search term and filters
  const fetchProducts = useCallback(async (params: URLSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      // Create a promise that resolves after a minimum display time (1.5 seconds)
      const minimumLoadingTime = new Promise((resolve) => setTimeout(resolve, 1500))

      // Fetch the products
      const fetchPromise = fetch(`/api/products-client?${params.toString()}`).then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        return res.json()
      })

      // Wait for both the fetch and minimum time to complete
      const [data] = await Promise.all([fetchPromise, minimumLoadingTime])

      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(data.currentPage || 1)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Update URL and fetch products when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== urlSearchTerm) {
      // Update URL with search term
      const params = new URLSearchParams(searchParams)
      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm)
      } else {
        params.delete("search")
      }

      // Reset to page 1 when search term changes
      params.delete("page")

      // Replace the URL without reloading the page
      router.replace(`/products?${params.toString()}`)

      // Fetch products with the new search term
      fetchProducts(params)
    }
  }, [debouncedSearchTerm, urlSearchTerm, router, searchParams, fetchProducts])

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts(new URLSearchParams(searchParams))
  }, [searchParams, fetchProducts])

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL with search term
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }

    // Reset to page 1 when search term changes
    params.delete("page")

    // Update URL
    router.push(`/products?${params.toString()}`)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // Update URL with page number
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`/products?${params.toString()}`)
  }

  // Handle filter changes
  const handleFilterChange = (filters: FilterType) => {
    // This is handled by the ProductFilters component
    console.log("Filters changed:", filters)
  }

  // Clear all filters but keep search term
  const clearAllFilters = () => {
    const params = new URLSearchParams()
    if (searchTerm) {
      params.set("search", searchTerm)
    }
    router.push(`/products?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <DollarTransferAnimation
          message={searchTerm ? "Searching products..." : "Loading products..."}
          size="large"
          dollarsCount={5}
          speed="normal"
        />
      </div>
    )
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
      <h1 className="text-2xl font-bold mb-6">All Products</h1>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col space-y-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <Input
            type="text"
            name="search"
            placeholder="Search products..."
            className="flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">Search</Button>

          {/* Mobile Filter Button */}
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <ProductFilters onFilterChange={handleFilterChange} className="py-4" />
            </SheetContent>
          </Sheet>
        </form>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>

            {currentFilters.category && (
              <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                Category: {currentFilters.category}
              </div>
            )}

            {(currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined) && (
              <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                Price:
                {currentFilters.minPrice !== undefined ? ` $${currentFilters.minPrice}` : " $0"}
                {" - "}
                {currentFilters.maxPrice !== undefined ? `$${currentFilters.maxPrice}` : "Any"}
              </div>
            )}

            {currentFilters.inStock && (
              <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                In Stock Only
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
              <X className="mr-1 h-3 w-3" /> Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-4">
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Search Results Info */}
          {(searchTerm || hasActiveFilters) && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {products.length === 0
                  ? `No products found${searchTerm ? ` for "${searchTerm}"` : ""}`
                  : `Showing ${products.length} results${searchTerm ? ` for "${searchTerm}"` : ""}`}
              </p>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">No products found with the current filters.</p>
              <Button variant="outline" className="mt-2" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <ProductList products={products} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  className={page === currentPage ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
