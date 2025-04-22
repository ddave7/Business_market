"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface ProductSearchProps {
  className?: string
  placeholder?: string
  initialValue?: string
  onSearch?: (term: string) => void
}

export default function ProductSearch({
  className = "",
  placeholder = "Search products...",
  initialValue = "",
  onSearch,
}: ProductSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialValue || searchParams.get("search") || "")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (onSearch) {
      // If onSearch prop is provided, call it
      onSearch(searchTerm)
    } else {
      // Otherwise, navigate to products page with search term
      const params = new URLSearchParams()
      if (searchTerm) params.set("search", searchTerm)
      router.push(`/products?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-wrap gap-2 ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
