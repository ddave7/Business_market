"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

// The inner form component that uses Stripe hooks
function CheckoutForm({ amount, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.log("Stripe.js hasn't loaded yet")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
        },
        redirect: "if_required",
      })

      if (error) {
        console.error("Payment error:", error)
        setErrorMessage(error.message || "An error occurred with your payment")
        onPaymentError(error.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent)
        onPaymentSuccess(paymentIntent.id)
      } else {
        console.log("Payment status:", paymentIntent?.status)
        setErrorMessage("Payment is pending or requires additional steps")
        onPaymentError("Payment requires additional steps")
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setErrorMessage("An unexpected error occurred")
      onPaymentError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <PaymentElement />

      <Button type="submit" disabled={!stripe || isLoading} className="w-full">
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  )
}

// The wrapper component that creates the payment intent and renders the Elements provider
export default function StripePaymentElement({ amount, onPaymentSuccess, onPaymentError }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Creating payment intent for amount:", amount)

        const response = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create payment intent")
        }

        const data = await response.json()
        console.log("Payment intent created:", data.paymentIntentId)
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error("Error creating payment intent:", err)
        setError(err.message || "Failed to initialize payment")
        onPaymentError(err.message || "Failed to initialize payment")
      } finally {
        setIsLoading(false)
      }
    }

    if (amount > 0) {
      createPaymentIntent()
    }
  }, [amount, onPaymentError])

  if (isLoading) {
    return <div className="py-4 text-center">Initializing payment...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!clientSecret) {
    return <div className="py-4 text-center">Unable to initialize payment</div>
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0284c7",
          },
        },
      }}
    >
      <CheckoutForm amount={amount} onPaymentSuccess={onPaymentSuccess} onPaymentError={onPaymentError} />
    </Elements>
  )
}
