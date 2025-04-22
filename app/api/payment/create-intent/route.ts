import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { createPaymentIntent } from "@/lib/stripe"
import { connectDB } from "@/lib/mongodb"

export async function POST(req: Request) {
  console.log("API: Payment intent creation route called")

  try {
    // Connect to database
    try {
      await connectDB()
      console.log("API: Connected to database")
    } catch (dbError) {
      console.error("API: Database connection error:", dbError)
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
        console.log("API: User not authenticated")
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
      console.log("API: User authenticated:", user._id)
    } catch (authError) {
      console.error("API: Authentication error:", authError)
      return NextResponse.json(
        { error: "Authentication failed", details: authError instanceof Error ? authError.message : "Unknown error" },
        { status: 401 },
      )
    }

    // Parse request body
    let requestData
    try {
      requestData = await req.json()
      console.log("API: Received payment request data:", requestData)
    } catch (parseError) {
      console.error("API: Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { amount, orderId, items } = requestData

    if (!amount || amount <= 0) {
      console.log("API: Invalid payment amount:", amount)
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 })
    }

    // Create a payment intent with Stripe
    try {
      console.log("API: Creating payment intent for amount:", amount)
      const { clientSecret, paymentIntentId } = await createPaymentIntent(amount, "usd", {
        userId: user._id.toString(),
        orderId: orderId || "pending",
        items: JSON.stringify(items || []),
      })

      console.log("API: Payment intent created successfully:", paymentIntentId)

      return NextResponse.json({
        clientSecret,
        paymentIntentId,
      })
    } catch (stripeError) {
      console.error("API: Stripe error creating payment intent:", stripeError)
      return NextResponse.json(
        {
          error: "Failed to create payment intent",
          details: stripeError instanceof Error ? stripeError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Unexpected error creating payment intent:", error)
    return NextResponse.json(
      {
        error: "Unexpected error creating payment intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
