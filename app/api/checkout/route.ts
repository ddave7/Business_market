import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import { getStripeInstance } from "@/lib/stripe"

// Helper function to check if a URL is a data URL or too long
function isValidImageUrl(url: string): boolean {
  if (!url) return false

  // Check if it's a data URL (starts with data:)
  if (url.startsWith("data:")) return false

  // Check if URL is too long for Stripe (limit is 2048 characters)
  if (url.length > 2000) return false

  return true
}

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

    // Parse request body first to get the data
    let requestData
    try {
      requestData = await req.json()
      console.log("Checkout API: Received data with", requestData.items?.length || 0, "items")
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

    const { items, subtotal, tax, shipping, total } = requestData

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Checkout API: Invalid cart items:", items)
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 })
    }

    // Get user from token (optional - will create guest checkout if not authenticated)
    let user
    try {
      user = await getUserFromToken(req)
      console.log("Checkout API: User authentication check:", user ? "Authenticated as " + user._id : "Guest checkout")
    } catch (authError) {
      console.log("Checkout API: Authentication error, proceeding as guest:", authError)
      // Continue as guest checkout
    }

    // Get Stripe instance
    let stripe
    try {
      stripe = getStripeInstance()
      console.log("Checkout API: Stripe instance created successfully")
    } catch (stripeError) {
      console.error("Checkout API: Error creating Stripe instance:", stripeError)
      return NextResponse.json(
        {
          error: "Stripe configuration error",
          details: stripeError instanceof Error ? stripeError.message : String(stripeError),
        },
        { status: 500 },
      )
    }

    // Create line items for Stripe with simplified approach
    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Product",
            // Only add images if they exist and are valid URLs
            ...(item.imageUrl && !item.imageUrl.startsWith("data:") && item.imageUrl.length < 2000
              ? { images: [item.imageUrl] }
              : {}),
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }
    })

    console.log("Checkout API: Prepared line items:", JSON.stringify(lineItems.slice(0, 1)))

    // Create Stripe checkout session
    try {
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      console.log("Checkout API: Using origin for redirect:", origin)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?canceled=true`,
        metadata: {
          userId: user ? user._id.toString() : "guest",
          orderReference: `order_ref_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round((shipping || 0) * 100),
                currency: "usd",
              },
              display_name: shipping === 0 ? "Free shipping" : "Standard shipping",
            },
          },
        ],
      })

      console.log("Checkout API: Created Stripe session:", session.id)
      return NextResponse.json({ sessionId: session.id })
    } catch (stripeError) {
      console.error("Checkout API: Stripe error:", stripeError)
      return NextResponse.json(
        {
          error: "Error creating checkout session",
          details: stripeError instanceof Error ? stripeError.message : String(stripeError),
          stripeError: JSON.stringify(stripeError),
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
