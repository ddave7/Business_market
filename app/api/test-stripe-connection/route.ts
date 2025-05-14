import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"

export async function GET() {
  try {
    // Check if Stripe is properly initialized
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "Stripe secret key is missing", status: "failed" }, { status: 500 })
    }

    // Try to make a simple Stripe API call
    const paymentMethods = await stripe.paymentMethods.list({
      limit: 1,
      type: "card",
    })

    return NextResponse.json({
      status: "success",
      message: "Stripe connection successful",
      apiVersion: stripe.getApiField("version"),
      hasPaymentMethods: paymentMethods.data.length > 0,
    })
  } catch (error) {
    console.error("Error testing Stripe connection:", error)
    return NextResponse.json(
      {
        status: "failed",
        error: "Failed to connect to Stripe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
