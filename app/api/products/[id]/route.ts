import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"

// Set proper headers for JSON response
const jsonHeaders = {
  "Content-Type": "application/json",
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log(`API: Fetching product with ID: ${params.id}`)

  try {
    await connectDB()
    console.log("API: Database connected")

    const user = await getUserFromToken(req)
    if (!user) {
      console.log("API: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: jsonHeaders })
    }

    const product = await Product.findById(params.id).populate("business", "businessName").lean()

    if (!product) {
      console.log(`API: Product with ID ${params.id} not found`)
      return NextResponse.json({ error: "Product not found" }, { status: 404, headers: jsonHeaders })
    }

    console.log(`API: Successfully fetched product: ${product.name}`)

    return NextResponse.json(product, { headers: jsonHeaders })
  } catch (error) {
    console.error(`API: Error fetching product ${params.id}:`, error)
    return NextResponse.json(
      { error: "Error fetching product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: jsonHeaders },
    )
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log(`API: Updating product with ID: ${params.id}`)

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
      console.log("API: Received product update data:", data)
    } catch (parseError) {
      console.error("API: Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: jsonHeaders })
    }

    // Find product
    let product
    try {
      product = await Product.findById(params.id)
      if (!product) {
        console.log(`API: Product with ID ${params.id} not found`)
        return NextResponse.json({ error: "Product not found" }, { status: 404, headers: jsonHeaders })
      }
    } catch (findError) {
      console.error("API: Error finding product:", findError)
      return NextResponse.json(
        {
          error: "Error finding product",
          details: findError instanceof Error ? findError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }

    // Check ownership
    if (product.business.toString() !== user._id.toString()) {
      console.log(`API: User ${user._id} does not own product ${params.id}`)
      return NextResponse.json(
        { error: "Not authorized to update this product" },
        { status: 403, headers: jsonHeaders },
      )
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

    // Update product
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        params.id,
        { $set: data },
        { new: true, runValidators: true },
      ).lean()

      console.log(`API: Product ${params.id} updated successfully`)
      return NextResponse.json(updatedProduct, { headers: jsonHeaders })
    } catch (updateError) {
      console.error("API: Error updating product:", updateError)

      // Check for validation errors from Mongoose
      if (updateError.name === "ValidationError") {
        const validationErrors = Object.values(updateError.errors).map((err: any) => err.message)
        return NextResponse.json(
          { error: "Validation failed", details: validationErrors },
          { status: 400, headers: jsonHeaders },
        )
      }

      return NextResponse.json(
        {
          error: "Error updating product",
          details: updateError instanceof Error ? updateError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }
  } catch (error) {
    console.error(`API: Unexpected error updating product ${params.id}:`, error)
    return NextResponse.json(
      { error: "Unexpected error updating product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: jsonHeaders },
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  console.log(`API: Deleting product with ID: ${params.id}`)

  try {
    await connectDB()
    console.log("API: Database connected")

    const user = await getUserFromToken(req)
    if (!user) {
      console.log("API: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: jsonHeaders })
    }

    const product = await Product.findById(params.id)
    if (!product) {
      console.log(`API: Product with ID ${params.id} not found`)
      return NextResponse.json({ error: "Product not found" }, { status: 404, headers: jsonHeaders })
    }

    // Check if user owns the product
    if (product.business.toString() !== user._id.toString()) {
      console.log(`API: User ${user._id} does not own product ${params.id}`)
      return NextResponse.json(
        { error: "Not authorized to delete this product" },
        { status: 403, headers: jsonHeaders },
      )
    }

    await Product.findByIdAndDelete(params.id)
    console.log(`API: Product ${params.id} deleted successfully`)

    return NextResponse.json({ success: true, message: "Product deleted successfully" }, { headers: jsonHeaders })
  } catch (error) {
    console.error(`API: Error deleting product ${params.id}:`, error)
    return NextResponse.json(
      { error: "Error deleting product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: jsonHeaders },
    )
  }
}
