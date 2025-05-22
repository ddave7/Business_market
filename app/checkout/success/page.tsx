"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"
import { useCart } from "@/app/contexts/CartContext"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      setError("No payment information found")
      setIsLoading(false)
      return
    }

    async function verifySession() {
      try {
        console.log("Verifying session:", sessionId)

        // Check if an order already exists for this session ID to prevent duplicates
        const checkResponse = await fetch(`/api/checkout/check-existing?session_id=${sessionId}`)
        const checkData = await checkResponse.json()

        if (checkData.exists) {
          console.log("Order already exists for this session, using existing order")
          setOrderId(checkData.orderId)
          // Clear the cart after successful payment
          clearCart()
          setIsLoading(false)
          return
        }

        // Verify the session with your backend
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error verifying payment:", errorData)
          setErrorDetails(errorData)
          throw new Error(errorData.error || "Failed to verify payment")
        }

        const data = await response.json()
        console.log("Payment verification response:", data)

        if (data.orderId) {
          setOrderId(data.orderId)
        }

        // Clear the cart after successful payment
        clearCart()
      } catch (err) {
        console.error("Error verifying session:", err)
        setError(err.message || "An error occurred while verifying your payment")
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [searchParams, clearCart])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <DollarTransferAnimation message="Processing your payment..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {errorDetails && (
              <div className="mb-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-bold mb-2">Error Details:</h3>
                <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(errorDetails, null, 2)}</pre>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push("/checkout")}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle>Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">Thank you for your purchase. Your order has been received and is being processed.</p>
          <div className="flex flex-col space-y-2">
            {orderId ? (
              <Link href={`/orders/${orderId}`}>
                <Button className="w-full">View Order Details</Button>
              </Link>
            ) : (
              <Link href="/orders">
                <Button className="w-full">View Your Orders</Button>
              </Link>
            )}
            <Link href="/products">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
