import Stripe from "stripe"

// Initialize Stripe with better error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not defined in environment variables")
} else if (stripeSecretKey.includes("***") || stripeSecretKey === "your_stripe_secret_key_here") {
  console.error("STRIPE_SECRET_KEY appears to be a placeholder and not a valid key")
}

// Create a function to get a Stripe instance that validates the key first
export function getStripeInstance() {
  if (!stripeSecretKey || stripeSecretKey.includes("***") || stripeSecretKey === "your_stripe_secret_key_here") {
    throw new Error(
      "Invalid or missing Stripe secret key. Please set a valid STRIPE_SECRET_KEY in your environment variables.",
    )
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
    timeout: 30000, // 30 second timeout
  })
}

// Create a Stripe instance
const stripeInstance = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      timeout: 30000,
    })
  : null

// Export as both default and named export to maintain compatibility
export default stripeInstance
export const stripe = stripeInstance

export async function createPaymentIntent(amount: number, currency = "usd", metadata: any = {}) {
  try {
    const stripeInstance = getStripeInstance()

    const paymentIntent = await stripeInstance.paymentIntents.create({
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
    const stripeInstance = getStripeInstance()

    return await stripeInstance.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw error
  }
}
