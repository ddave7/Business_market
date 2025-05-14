import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  console.log("Checkout API: Starting checkout process")

  try {
    // Connect to database
    try {
      await connectDB()
      console.log("Checkout API: Connected to database")
    } catch (dbError) {
      console.error("Checkout API: Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Failed to connect to database",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // Get user from token
    let user
    try {
      user = await getUserFromToken(req)
      console.log("Checkout API: User authentication check:", user ? "Authenticated" : "Not authenticated")
    } catch (authError) {
      console.error("Checkout API: Authentication error:", authError)
      return NextResponse.json(
        { error: "Authentication error", details: authError instanceof Error ? authError.message : String(authError) },
        { status: 401 },
      )
    }

    // Parse request body
    let cartItems
    try {
      const body = await req.json()
      cartItems = body.items

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        console.error("Checkout API: Invalid cart items:", cartItems)
        return NextResponse.json({ error: "Invalid cart items" }, { status: 400 })
      }

      console.log("Checkout API: Received cart items:", JSON.stringify(cartItems).substring(0, 200) + "...")
    } catch (parseError) {
      console.error("Checkout API: Error parsing request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    // Validate products and prepare line items
    const lineItems = []
    const productDetails = []

    try {
      // Get product details and validate
      for (const item of cartItems) {
        if (!item.id || !item.quantity) {
          console.error("Checkout API: Invalid item in cart:", item)
          return NextResponse.json({ error: "Invalid item in cart" }, { status: 400 })
        }

        const product = await Product.findById(item.id).populate("business", "name email")

        if (!product) {
          console.error(`Checkout API: Product not found: ${item.id}`)
          return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 404 })
        }

        // No business verification check here anymore

        // Store product details for order creation
        productDetails.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          business: product.business._id,
          businessName: product.business.name,
          businessEmail: product.business.email,
        })

        // Prepare Stripe line item
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description.substring(0, 500), // Stripe limits description length
              images: product.imageUrl
                ? [
                    product.imageUrl.startsWith("http")
                      ? product.imageUrl
                      : `${process.env.NEXT_PUBLIC_API_URL || ""}${product.imageUrl}`,
                  ]
                : [],
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })
      }

      console.log("Checkout API: Prepared line items:", JSON.stringify(lineItems).substring(0, 200) + "...")
    } catch (productError) {
      console.error("Checkout API: Error validating products:", productError)
      return NextResponse.json(
        {
          error: "Error validating products",
          details: productError instanceof Error ? productError.message : String(productError),
        },
        { status: 500 },
      )
    }

    // Create Stripe checkout session
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("Checkout API: Missing Stripe secret key")
        return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 })
      }

      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      console.log("Checkout API: Using origin for redirect:", origin)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?canceled=true`,
        metadata: {
          productDetails: JSON.stringify(productDetails),
          userId: user ? user._id.toString() : "guest",
        },
      })

      console.log("Checkout API: Created Stripe session:", session.id)
      return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (stripeError) {
      console.error("Checkout API: Stripe error:", stripeError)
      return NextResponse.json(
        {
          error: "Error creating checkout session",
          details: stripeError instanceof Error ? stripeError.message : String(stripeError),
          stripeError: stripeError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Checkout API: Unexpected error:", error)
    return NextResponse.json(
      { error: "Unexpected error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
