"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

function PaymentStatus() {
  const stripe = useStripe()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe) {
      return
    }

    // Extract the client secret from the URL
    const clientSecret = searchParams.get("payment_intent_client_secret")

    if (!clientSecret) {
      setStatus("error")
      setMessage("No payment information found")
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log("Payment intent retrieved:", paymentIntent)

      switch (paymentIntent?.status) {
        case "succeeded":
          setStatus("success")
          setMessage("Payment successful! Your order is being processed.")

          // Get the order ID from metadata if available
          if (paymentIntent.metadata?.orderId && paymentIntent.metadata.orderId !== "pending") {
            setOrderId(paymentIntent.metadata.orderId)
          } else {
            // If no order ID in metadata, try to create the order
            createOrder(paymentIntent)
          }
          break

        case "processing":
          setStatus("loading")
          setMessage("Your payment is processing.")
          break

        case "requires_payment_method":
          setStatus("error")
          setMessage("Your payment was not successful, please try again.")
          break

        default:
          setStatus("error")
          setMessage("Something went wrong with your payment.")
          break
      }
    })
  }, [stripe, searchParams])

  const createOrder = async (paymentIntent) => {
    try {
      // Here you would implement the logic to create an order
      // This is a placeholder - you would need to implement the actual order creation
      console.log("Would create order for payment intent:", paymentIntent.id)

      // For now, just redirect to orders page after a delay
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (error) {
      console.error("Error creating order:", error)
      setStatus("error")
      setMessage("Payment successful, but there was an issue creating your order. Please contact support.")
    }
  }

  const handleContinue = () => {
    if (orderId) {
      router.push(`/orders/${orderId}/confirmation`)
    } else {
      router.push("/orders")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      {status === "loading" && (
        <div className="text-center">
          <DollarTransferAnimation message={message} />
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-4">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button onClick={handleContinue}>{orderId ? "View Order Details" : "View Your Orders"}</Button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-4 max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <div className="pt-4">
            <Button onClick={() => router.push("/checkout")}>Try Again</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentConfirmationPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentStatus />
    </Elements>
  )
}
