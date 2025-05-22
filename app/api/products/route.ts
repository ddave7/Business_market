import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"

// Set proper headers for JSON response
const jsonHeaders = {
  "Content-Type": "application/json",
}

export async function POST(req: Request) {
  console.log("API: Product creation route called")

  try {
    // Connect to database
    try {
      await connectDB()
      console.log("API: Connected to database")
    } catch (dbError) {
      console.error("API: Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }

    // Authenticate user
    let user
    try {
      user = await getUserFromToken(req)
      if (!user) {
        console.log("API: User not authenticated")
        return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: jsonHeaders })
      }
      console.log("API: User authenticated:", user._id)
    } catch (authError) {
      console.error("API: Authentication error:", authError)
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: authError instanceof Error ? authError.message : "Unknown error",
        },
        { status: 401, headers: jsonHeaders },
      )
    }

    // Parse request body
    let data
    try {
      data = await req.json()
      console.log("API: Received product data:", data)
    } catch (parseError) {
      console.error("API: Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: jsonHeaders })
    }

    // Validate required fields
    const requiredFields = ["name", "description", "price", "category", "stock"]
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        console.log(`API: Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400, headers: jsonHeaders })
      }
    }

    // Validate numeric fields
    if (isNaN(data.price) || data.price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400, headers: jsonHeaders },
      )
    }

    if (isNaN(data.stock) || data.stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a valid positive number" },
        { status: 400, headers: jsonHeaders },
      )
    }

    // Create product
    try {
      // Create product with business reference
      const product = await Product.create({
        ...data,
        business: user._id,
      })

      console.log("API: Product created successfully:", product._id)

      return NextResponse.json(product, { status: 201, headers: jsonHeaders })
    } catch (dbError) {
      console.error("API: Database error creating product:", dbError)

      // Check for validation errors from Mongoose
      if (dbError.name === "ValidationError") {
        const validationErrors = Object.values(dbError.errors).map((err: any) => err.message)
        return NextResponse.json(
          { error: "Validation failed", details: validationErrors },
          { status: 400, headers: jsonHeaders },
        )
      }

      return NextResponse.json(
        {
          error: "Error creating product in database",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }
  } catch (error) {
    console.error("API: Unexpected error creating product:", error)
    return NextResponse.json(
      {
        error: "Unexpected error creating product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: jsonHeaders },
    )
  }
}

// Keep the GET method as is...
export async function GET(req: Request) {
  // Existing GET implementation...
}
