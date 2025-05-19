import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import Product from "@/models/Product"

// Helper function to validate if a URL is absolute and publicly accessible
function isValidImageUrl(url: string): boolean {
  // Check if it's a valid absolute URL
  if (!url) return false

  // Skip data URLs and relative URLs
  if (url.startsWith("data:") || url.startsWith("/")) return false

  // Check if it's a valid URL format
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Helper function to get absolute URL
function getAbsoluteUrl(url: string): string {
  if (!url) return ""

  // If it's already an absolute URL, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // If it's a relative URL, make it absolute
  if (url.startsWith("/")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    return `${baseUrl}${url}`
  }

  // If it's not a valid URL, return empty string
  return ""
}

export async function POST(req: Request) {
  console.log("Checkout API: Starting checkout session creation")

  try {
    // Connect to database
    await connectDB()
    console.log("Checkout API: Connected to database")

    // Get user from token
    const user = await getUserFromToken(req)
    if (!user) {
      console.log("Checkout API: No authenticated user found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    console.log("Checkout API: User authenticated:", user._id)

    // Get cart items from request
    const { cartItems, shippingDetails } = await req.json()
    console.log("Checkout API: Received cart items:", cartItems.length)

    if (!cartItems || cartItems.length === 0) {
      console.log("Checkout API: No cart items provided")
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    // Fetch product details from database to verify prices
    const productIds = cartItems.map((item) => item.id)
    const products = await Product.find({ _id: { $in: productIds } })
    console.log("Checkout API: Fetched products from database:", products.length)

    if (products.length !== productIds.length) {
      console.log("Checkout API: Some products not found")
      return NextResponse.json({ error: "Some products not found" }, { status: 400 })
    }

    // Create line items for Stripe
    const lineItems = cartItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.id)

      if (!product) {
        throw new Error(`Product not found: ${item.id}`)
      }

      // Process image URL for Stripe
      const imageUrls = []
      if (product.imageUrl && product.imageUrl !== "/placeholder.svg") {
        const absoluteUrl = getAbsoluteUrl(product.imageUrl)
        if (isValidImageUrl(absoluteUrl)) {
          imageUrls.push(absoluteUrl)
        }
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description.substring(0, 255),
            images: imageUrls.length > 0 ? imageUrls : undefined,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }
    })

    console.log("Checkout API: Created line items for Stripe")

    // Create Stripe checkout session
    try {
      console.log("Checkout API: Creating Stripe checkout session")

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/checkout`,
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"],
        },
        metadata: {
          userId: user._id.toString(),
          shippingName: shippingDetails?.name || "",
          shippingAddress: shippingDetails?.address || "",
          shippingCity: shippingDetails?.city || "",
          shippingState: shippingDetails?.state || "",
          shippingZip: shippingDetails?.zip || "",
          shippingCountry: shippingDetails?.country || "",
        },
      })

      console.log("Checkout API: Stripe session created successfully:", session.id)

      return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (stripeError) {
      console.error("Checkout API: Stripe error:", stripeError)
      return NextResponse.json(
        {
          error: "Error creating checkout session",
          details: stripeError.message,
          stripeError: JSON.stringify(stripeError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Checkout API: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Error creating checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
