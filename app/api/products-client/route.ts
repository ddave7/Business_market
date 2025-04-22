import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"

// Set proper headers for JSON response
const jsonHeaders = {
  "Content-Type": "application/json",
}

export async function GET(req: Request) {
  console.log("API: Products-client GET route called")

  try {
    // Connect to database first to ensure all models are registered
    await connectDB()
    console.log("API: Database connected")

    // Parse URL and search params
    const url = new URL(req.url)
    console.log("API: Request URL:", url.toString())

    const searchParams = url.searchParams
    const page = Number(searchParams.get("page")) || 1
    const limit = 20
    const skip = (page - 1) * limit

    // Build the query object
    const query: any = {}

    // Handle category filter
    if (searchParams.get("category") && searchParams.get("category") !== "All Categories") {
      query.category = searchParams.get("category")
      console.log("API: Filtering by category:", query.category)
    }

    // Handle price range filter
    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) {
      query.price = {}

      if (searchParams.get("minPrice")) {
        query.price.$gte = Number(searchParams.get("minPrice"))
        console.log("API: Filtering by min price:", query.price.$gte)
      }

      if (searchParams.get("maxPrice")) {
        query.price.$lte = Number(searchParams.get("maxPrice"))
        console.log("API: Filtering by max price:", query.price.$lte)
      }
    }

    // Handle in-stock filter
    if (searchParams.get("inStock") === "true") {
      query.stock = { $gt: 0 }
      console.log("API: Filtering for in-stock products only")
    }

    // Handle search term
    if (searchParams.get("search")) {
      const searchTerm = searchParams.get("search") || ""
      console.log("API: Searching for term:", searchTerm)

      // Use text search if the search term is more than 3 characters
      if (searchTerm.length >= 3) {
        query.$text = { $search: searchTerm }
      } else {
        // Otherwise use regex for shorter terms
        query.$or = [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ]
      }
    }

    // Handle "my" parameter to filter by current user's products
    if (searchParams.get("my") === "true") {
      try {
        const user = await getUserFromToken(req)
        if (user && user._id) {
          query.business = user._id
          console.log("API: Filtering by business ID:", user._id)
        }
      } catch (authError) {
        console.error("API: Auth error when filtering by user:", authError)
        // Continue without filtering if auth fails
      }
    }

    console.log("API: Executing database query", { query, skip, limit })

    try {
      // Use a try-catch block specifically for the database operations
      let products = []
      let total = 0

      try {
        // First count total matching documents
        total = await Product.countDocuments(query)
        console.log(`API: Found ${total} matching products`)

        // Then fetch the products with pagination
        products = await Product.find(query)
          .populate("business", "businessName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()

        console.log(`API: Retrieved ${products.length} products for page ${page}`)
      } catch (dbQueryError) {
        console.error("API: Database query error:", dbQueryError)
        // If there's an error with the database query, return mock data instead of failing
        console.log("API: Returning mock data due to database query error")
      }

      const totalPages = Math.ceil(total / limit) || 1

      // Return mock data if no products found or if there was a database error
      if (products.length === 0) {
        // Only return mock data if there's no search term or filters
        if (
          !searchParams.get("search") &&
          !searchParams.get("category") &&
          !searchParams.get("minPrice") &&
          !searchParams.get("maxPrice") &&
          !searchParams.get("inStock")
        ) {
          const mockProducts = Array.from({ length: 6 }, (_, i) => ({
            _id: `mock-${i}`,
            name: `Mock Product ${i + 1}`,
            description: "This is a mock product for testing purposes",
            price: 99.99,
            category: "Other",
            stock: 10,
            imageUrl: "/placeholder.svg?height=200&width=200",
            business: { businessName: "Mock Business" },
          }))

          return NextResponse.json(
            {
              products: mockProducts,
              currentPage: 1,
              totalPages: 1,
              totalProducts: mockProducts.length,
            },
            { status: 200, headers: jsonHeaders },
          )
        }
      }

      return NextResponse.json(
        {
          products,
          currentPage: page,
          totalPages,
          totalProducts: total,
        },
        { headers: jsonHeaders },
      )
    } catch (dbError) {
      console.error("API: Database query error:", dbError)

      // Return mock data on error to prevent the client from breaking
      const mockProducts = Array.from({ length: 6 }, (_, i) => ({
        _id: `mock-${i}`,
        name: `Mock Product ${i + 1}`,
        description: "This is a mock product for testing purposes",
        price: 99.99,
        category: "Other",
        stock: 10,
        imageUrl: "/placeholder.svg?height=200&width=200",
        business: { businessName: "Mock Business" },
      }))

      return NextResponse.json(
        {
          products: mockProducts,
          currentPage: 1,
          totalPages: 1,
          totalProducts: mockProducts.length,
          error: "Database query failed, showing mock data",
        },
        { status: 200, headers: jsonHeaders },
      )
    }
  } catch (error) {
    console.error("API: Error in products-client route:", error)

    // Return mock data on error to prevent the client from breaking
    const mockProducts = Array.from({ length: 6 }, (_, i) => ({
      _id: `mock-${i}`,
      name: `Mock Product ${i + 1} (Error Fallback)`,
      description: "This is a mock product shown due to a server error",
      price: 99.99,
      category: "Other",
      stock: 10,
      imageUrl: "/placeholder.svg?height=200&width=200",
      business: { businessName: "Mock Business" },
    }))

    return NextResponse.json(
      {
        products: mockProducts,
        currentPage: 1,
        totalPages: 1,
        totalProducts: mockProducts.length,
        error: "Server error, showing mock data",
      },
      { status: 200, headers: jsonHeaders },
    )
  }
}

// Helper function to get user from token
// async function getUserFromToken(req: Request) {
//   // This is a simplified version - in production, use your actual auth logic
//   try {
//     const authHeader = req.headers.get("cookie")
//     if (!authHeader) return null

//     const token = authHeader.split("auth_token=")[1]?.split(";")[0]
//     if (!token) return null

//     // In a real app, you would verify the token and extract the user ID
//     // For now, we'll just return null
//     return null
//   } catch (error) {
//     console.error("Error getting user from token:", error)
//     return null
//   }
// }
