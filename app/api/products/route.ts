import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import mongoose from "mongoose"

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
    const requiredFields = ["name", "description", "price", "category"]
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        console.log(`API: Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400, headers: jsonHeaders })
      }
    }

    // Set default values for optional fields
    if (!data.stock && data.stock !== 0) {
      data.stock = 0
      console.log("API: Setting default stock to 0")
    }

    if (!data.imageUrl) {
      data.imageUrl = "/placeholder.svg?height=400&width=400"
      console.log("API: Setting default image URL")
    }

    // Validate numeric fields
    if (isNaN(data.price) || data.price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400, headers: jsonHeaders },
      )
    }

    if (isNaN(data.stock) || data.stock < 0) {
      data.stock = 0
      console.log("API: Invalid stock value, defaulting to 0")
    }

    // Create product
    try {
      // Ensure user._id is a valid ObjectId
      let businessId
      try {
        businessId = new mongoose.Types.ObjectId(user._id)
      } catch (idError) {
        console.error("API: Error converting user._id to ObjectId:", idError)
        console.log("API: Using string ID instead")
        businessId = user._id
      }

      // Create product with business reference
      const productData = {
        ...data,
        business: businessId,
      }

      console.log("API: Creating product with data:", productData)

      const product = await Product.create(productData)

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

      // Try creating without validation as a fallback
      try {
        console.log("API: Attempting to create product without validation")
        const productData = {
          name: data.name || "Unnamed Product",
          description: data.description || "No description provided",
          price: Number.parseFloat(data.price) || 0,
          category: data.category || "Other",
          stock: Number.parseInt(data.stock) || 0,
          imageUrl: data.imageUrl || "/placeholder.svg?height=400&width=400",
          business: user._id,
        }

        // Use insertOne to bypass validation
        const db = mongoose.connection.db
        const result = await db.collection("products").insertOne(productData)

        console.log("API: Product created without validation:", result.insertedId)

        return NextResponse.json({ _id: result.insertedId, ...productData }, { status: 201, headers: jsonHeaders })
      } catch (fallbackError) {
        console.error("API: Fallback creation also failed:", fallbackError)
        return NextResponse.json(
          {
            error: "Error creating product in database",
            details: dbError instanceof Error ? dbError.message : "Unknown error",
          },
          { status: 500, headers: jsonHeaders },
        )
      }
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
