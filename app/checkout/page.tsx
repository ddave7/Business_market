"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "../contexts/CartContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DollarTransferAnimation from "../components/DollarTransferAnimation"
import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe with better error handling
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!publishableKey) {
  console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables")
}

const stripePromise = publishableKey ? loadStripe(publishableKey) : null

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  // Check for canceled parameter
  const canceled = searchParams.get("canceled")

  // Calculate order totals
  const subtotal = getCartTotal()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
  const total = subtotal + tax + shipping

  // Check if cart is empty and redirect to products
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/products")
    }

    // Show error if payment was canceled
    if (canceled) {
      setError("Payment was canceled. Please try again.")
    }
  }, [cart, router, canceled])

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setErrorDetails(null)

      console.log("Starting checkout process...")

      // Check if Stripe is initialized
      if (!stripePromise) {
        throw new Error("Payment service is not configured properly. Missing Stripe publishable key.")
      }

      // Prepare cart items for checkout
      const checkoutItems = cart.map((item) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }))

      console.log("Sending checkout request with items:", checkoutItems)

      // Create a checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: checkoutItems,
          subtotal,
          tax,
          shipping,
          total,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Checkout API error:", data)
        setErrorDetails(data)
        throw new Error(data.error || data.details || "Failed to create checkout session")
      }

      const { sessionId } = data
      console.log("Checkout session created:", sessionId)

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error("Stripe redirect error:", error)
        throw new Error(error.message)
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err.message || "An error occurred during checkout")
    } finally {
      setIsLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <DollarTransferAnimation message="Redirecting to products..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {errorDetails && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Error Details:</h3>
          <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(errorDetails, null, 2)}</pre>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <div className="pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="mb-2">
                Click the button below to proceed to our secure payment page. You'll be able to review your order before
                finalizing payment.
              </p>

              {!publishableKey && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Stripe publishable key is missing. Please check your environment variables.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button onClick={handleCheckout} disabled={isLoading || !publishableKey} className="w-full">
              {isLoading ? (
                <div className="flex items-center">
                  <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
