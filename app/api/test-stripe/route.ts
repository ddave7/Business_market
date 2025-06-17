import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        error: "STRIPE_SECRET_KEY is not defined in environment variables",
      })
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    // Try to make a simple API call to verify the key works
    try {
      // Get Stripe account details (a simple API call that should work with any valid key)
      const account = await stripe.balance.retrieve()

      return NextResponse.json({
        success: true,
        message: "Stripe secret key is valid",
      })
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError)
      return NextResponse.json({
        success: false,
        error: stripeError instanceof Error ? stripeError.message : "Unknown Stripe error",
      })
    }
  } catch (error) {
    console.error("Error testing Stripe configuration:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
