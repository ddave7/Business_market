import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import Stripe from "stripe"

// Initialize Stripe with more explicit error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not defined in environment variables")
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
})

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
  console.log("Checkout API called")

  try {
    // Connect to database
    try {
      await connectDB()
      console.log("Connected to database")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 },
      )
    }

    // Authenticate user
    let user
    try {
      user = await getUserFromToken(req)
      if (!user) {
        console.log("User not authenticated")
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
      console.log("User authenticated:", user._id)
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        { error: "Authentication failed", details: authError instanceof Error ? authError.message : "Unknown error" },
        { status: 401 },
      )
    }

    // Parse request body
    let requestData
    try {
      requestData = await req.json()
      console.log("Received checkout data with", requestData.items?.length || 0, "items")
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { items, subtotal, tax, shipping, total } = requestData

    if (!items || !items.length) {
      console.log("No items in cart")
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    // Validate Stripe is properly initialized
    if (!stripeSecretKey) {
      console.error("Stripe secret key is missing")
      return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
    }

    console.log("Creating Stripe checkout session...")

    // Create line items for Stripe with image URL validation
    const lineItems = items.map((item) => {
      // Create a product data object
      const productData = {
        name: item.name,
      }

      // Only add images if the URL is valid and not too long
      if (item.imageUrl && isValidImageUrl(item.imageUrl)) {
        productData.images = [item.imageUrl]
      } else {
        console.log(`Skipping invalid image URL for item: ${item.name}`)
      }

      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      }
    })

    // Get origin for success and cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:3000"
    console.log("Using origin for redirect URLs:", origin)

    // Create Stripe checkout session with try/catch
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?canceled=true`,
        metadata: {
          userId: user._id.toString(),
          orderReference: `order_ref_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round(shipping * 100),
                currency: "usd",
              },
              display_name: shipping === 0 ? "Free shipping" : "Standard shipping",
            },
          },
        ],
      })

      console.log("Checkout session created successfully:", session.id)

      return NextResponse.json({ sessionId: session.id })
    } catch (stripeError) {
      console.error("Stripe error creating checkout session:", stripeError)
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: stripeError instanceof Error ? stripeError.message : "Unknown Stripe error",
          stripeError: stripeError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error creating checkout session:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
        fullError: error,
      },
      { status: 500 },
    )
  }
}
