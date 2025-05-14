import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "STRIPE_SECRET_KEY is not defined in environment variables",
        },
        { status: 500 },
      )
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    // Try to make a simple API call to verify the key works
    const balance = await stripe.balance.retrieve()

    return NextResponse.json({
      success: true,
      message: "Stripe connection successful",
      available: balance.available.map((b) => ({ amount: b.amount, currency: b.currency })),
      pending: balance.pending.map((b) => ({ amount: b.amount, currency: b.currency })),
    })
  } catch (error) {
    console.error("Stripe connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 },
    )
  }
}
