"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Home & Garden",
  "Office Supplies",
  "Other",
]

export interface ProductFiltersProps {
  onFilterChange?: (filters: ProductFilters) => void
  className?: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
}

export default function ProductFilters({ onFilterChange, className = "" }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    inStock: searchParams.get("inStock") === "true",
    search: searchParams.get("search") || "",
  })

  // Track if any filters are active
  const hasActiveFilters =
    (filters.category !== "" && filters.category !== "All Categories") ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock

  // Update URL when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }, [filters, onFilterChange])

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Apply filters to URL and trigger search
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    // Update search params
    if (filters.category && filters.category !== "All Categories") {
      params.set("category", filters.category)
    } else {
      params.delete("category")
    }

    if (filters.minPrice !== undefined) {
      params.set("minPrice", filters.minPrice.toString())
    } else {
      params.delete("minPrice")
    }

    if (filters.maxPrice !== undefined) {
      params.set("maxPrice", filters.maxPrice.toString())
    } else {
      params.delete("maxPrice")
    }

    if (filters.inStock) {
      params.set("inStock", "true")
    } else {
      params.delete("inStock")
    }

    // Keep existing search term
    if (filters.search) {
      params.set("search", filters.search)
    }

    // Reset to page 1 when filters change
    params.delete("page")

    // Update URL
    router.push(`/products?${params.toString()}`)
  }

  // Reset all filters
  const resetFilters = () => {
    // Keep only search term if it exists
    const searchTerm = filters.search
    setFilters({
      category: "",
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
      search: searchTerm,
    })

    // Update URL - keep only search term
    const params = new URLSearchParams()
    if (searchTerm) {
      params.set("search", searchTerm)
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
            <X className="mr-1 h-3 w-3" /> Clear Filters
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category || "All Categories"}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div>
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Input
                type="number"
                placeholder="Min $"
                value={filters.minPrice || ""}
                onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                min={0}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice || ""}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* In Stock Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
          />
          <Label htmlFor="inStock" className="cursor-pointer">
            In Stock Only
          </Label>
        </div>

        {/* Apply Filters Button */}
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
