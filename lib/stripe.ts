import Stripe from "stripe"

// Initialize Stripe with better error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not defined in environment variables")
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2023-10-16", // Use the latest API version
  timeout: 30000, // 30 second timeout
})

export default stripe

export async function createPaymentIntent(amount: number, currency = "usd", metadata: any = {}) {
  try {
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key is missing")
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key is missing")
    }

    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw error
  }
}
