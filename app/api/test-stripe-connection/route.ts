import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    // Check if keys are set
    const keyStatus = {
      secretKey: {
        exists: !!stripeSecretKey,
        valid:
          !!stripeSecretKey && !stripeSecretKey.includes("***") && stripeSecretKey !== "your_stripe_secret_key_here",
        preview: stripeSecretKey
          ? `${stripeSecretKey.substring(0, 7)}...${stripeSecretKey.substring(stripeSecretKey.length - 4)}`
          : "not set",
      },
      publishableKey: {
        exists: !!stripePublishableKey,
        valid:
          !!stripePublishableKey &&
          !stripePublishableKey.includes("***") &&
          stripePublishableKey !== "your_stripe_publishable_key_here",
        preview: stripePublishableKey
          ? `${stripePublishableKey.substring(0, 7)}...${stripePublishableKey.substring(stripePublishableKey.length - 4)}`
          : "not set",
      },
    }

    // If keys are missing or invalid, return helpful information
    if (!keyStatus.secretKey.valid || !keyStatus.publishableKey.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing Stripe keys",
          keyStatus,
          helpMessage:
            "Please set valid Stripe API keys in your environment variables. You can get these from your Stripe dashboard.",
        },
        { status: 500 },
      )
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    // Try to make a simple API call to verify the key works
    try {
      const balance = await stripe.balance.retrieve()

      return NextResponse.json({
        success: true,
        message: "Stripe connection successful",
        keyStatus,
        available: balance.available.map((b) => ({ amount: b.amount, currency: b.currency })),
        pending: balance.pending.map((b) => ({ amount: b.amount, currency: b.currency })),
      })
    } catch (stripeError) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe API call failed",
          details: stripeError instanceof Error ? stripeError.message : String(stripeError),
          keyStatus,
          helpMessage:
            "Your Stripe keys are set but the API call failed. This could be due to invalid keys or network issues.",
        },
        { status: 500 },
      )
    }
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
