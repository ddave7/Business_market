import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import stripe from "@/lib/stripe"

// Set proper headers for JSON response
const jsonHeaders = {
  "Content-Type": "application/json",
}

export async function POST(req: Request) {
  console.log("API: Order creation route called")

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
    let orderData
    try {
      orderData = await req.json()
      console.log("API: Received order data")
    } catch (parseError) {
      console.error("API: Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: jsonHeaders })
    }

    // Validate required fields
    const requiredFields = ["items", "shippingAddress", "paymentMethod", "subtotal", "tax", "shipping", "total"]
    for (const field of requiredFields) {
      if (!orderData[field]) {
        console.log(`API: Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400, headers: jsonHeaders })
      }
    }

    // Validate items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400, headers: jsonHeaders })
    }

    // Verify payment if using Stripe
    if (orderData.paymentMethod === "credit_card" && orderData.paymentDetails?.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(orderData.paymentDetails.paymentIntentId)

        if (paymentIntent.status !== "succeeded") {
          return NextResponse.json(
            { error: `Payment not completed. Status: ${paymentIntent.status}` },
            { status: 400, headers: jsonHeaders },
          )
        }

        // Add payment details from Stripe
        if (paymentIntent.payment_method_details?.card) {
          const card = paymentIntent.payment_method_details.card
          orderData.paymentDetails.cardBrand = card.brand
          orderData.paymentDetails.cardLastFour = card.last4
          orderData.paymentDetails.transactionId = paymentIntent.id
        }
      } catch (stripeError) {
        console.error("API: Error verifying payment with Stripe:", stripeError)
        return NextResponse.json({ error: "Could not verify payment" }, { status: 400, headers: jsonHeaders })
      }
    }

    // Check product availability and update stock
    try {
      for (const item of orderData.items) {
        const product = await Product.findById(item.product)

        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${item.product}` },
            { status: 400, headers: jsonHeaders },
          )
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for product: ${product.name}` },
            { status: 400, headers: jsonHeaders },
          )
        }

        // Update product stock
        product.stock -= item.quantity
        await product.save()
      }
    } catch (stockError) {
      console.error("API: Error checking product stock:", stockError)
      return NextResponse.json({ error: "Error checking product availability" }, { status: 500, headers: jsonHeaders })
    }

    // Create order
    try {
      const order = await Order.create({
        ...orderData,
        user: user._id,
        status: orderData.paymentMethod === "credit_card" ? "processing" : "pending",
      })

      console.log("API: Order created successfully:", order._id)

      return NextResponse.json(order, { status: 201, headers: jsonHeaders })
    } catch (dbError) {
      console.error("API: Database error creating order:", dbError)

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
          error: "Error creating order in database",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }
  } catch (error) {
    console.error("API: Unexpected error creating order:", error)
    return NextResponse.json(
      {
        error: "Unexpected error creating order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: jsonHeaders },
    )
  }
}

export async function GET(req: Request) {
  try {
    await connectDB()

    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: jsonHeaders })
    }

    // Parse URL and search params
    const url = new URL(req.url)
    const searchParams = url.searchParams
    const page = Number(searchParams.get("page")) || 1
    const limit = 10
    const skip = (page - 1) * limit

    // Get orders for the user
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Order.countDocuments({ user: user._id })
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        orders,
        currentPage: page,
        totalPages,
        totalOrders: total,
      },
      { headers: jsonHeaders },
    )
  } catch (error) {
    console.error("API: Error fetching orders:", error)
    return NextResponse.json(
      { error: "Error fetching orders", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: jsonHeaders },
    )
  }
}
