import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import Stripe from "stripe"
import Order from "@/models/Order"

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not defined in environment variables")
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16",
})

export async function GET(req: Request) {
  try {
    console.log("Verify checkout session API called")

    // Get session ID from query params
    const url = new URL(req.url)
    const sessionId = url.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("Retrieving Stripe session:", sessionId)

    // Retrieve the session
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "payment_intent"],
      })

      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
      }

      console.log("Payment verified successfully")

      // Check if an order with this session ID already exists
      const existingOrder = await Order.findOne({
        "paymentDetails.sessionId": sessionId,
        user: user._id,
      })

      if (existingOrder) {
        console.log("Order already exists for this session, returning existing order")
        return NextResponse.json({
          success: true,
          orderId: existingOrder._id,
          existing: true,
        })
      }

      // Create an order record in your database
      const order = await Order.create({
        user: user._id,
        items: session.line_items.data.map((item) => ({
          name: item.description,
          price: item.amount_total / 100 / item.quantity,
          quantity: item.quantity,
        })),
        paymentMethod: "credit_card",
        paymentDetails: {
          transactionId: session.payment_intent?.id || sessionId,
          sessionId: sessionId,
        },
        subtotal: session.amount_subtotal / 100,
        tax: (session.amount_total - session.amount_subtotal - (session.shipping_cost?.amount_total || 0) / 100) / 100,
        shipping: (session.shipping_cost?.amount_total || 0) / 100,
        total: session.amount_total / 100,
        status: "processing",
        shippingAddress: {
          // You would need to get this from the session or have the user provide it separately
          fullName: user.businessName,
          address: "Address from Stripe",
          city: "City",
          state: "State",
          postalCode: "12345",
          country: "Country",
        },
      })

      console.log("Order created:", order._id)

      return NextResponse.json({
        success: true,
        orderId: order._id,
      })
    } catch (stripeError) {
      console.error("Error retrieving Stripe session:", stripeError)
      return NextResponse.json(
        {
          error: "Failed to verify payment",
          details: stripeError instanceof Error ? stripeError.message : "Unknown Stripe error",
          stripeError: stripeError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error verifying checkout session:", error)
    return NextResponse.json(
      { error: "Failed to verify checkout session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
