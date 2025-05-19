"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import LoadingOverlay from "@/app/components/LoadingOverlay"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")

  const sessionId = searchParams.get("session_id")
  const testOrderId = searchParams.get("test_order")

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setLoading(true)

        // Handle test orders
        if (testOrderId) {
          setOrder({
            id: testOrderId,
            isTestOrder: true,
            total: 0,
            items: [],
            createdAt: new Date().toISOString(),
          })
          setLoading(false)
          return
        }

        // Handle real Stripe orders
        if (!sessionId) {
          setError("No session ID provided")
          setLoading(false)
          return
        }

        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify checkout session")
        }

        setOrder(data.order)
      } catch (error) {
        console.error("Error fetching order details:", error)
        setError(error.message || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [sessionId, testOrderId])

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Processing your order..." />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>There was a problem processing your order</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push("/checkout")}>Return to Checkout</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>
            {order?.isTestOrder
              ? "This is a test order - no payment was processed"
              : "Your payment was processed successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">Order Reference</p>
            <p className="font-medium">{order?.id || testOrderId}</p>
          </div>

          {order?.isTestOrder ? (
            <p className="text-center text-sm text-muted-foreground">
              This was a test order created using the simple checkout. In a real order, you would see your order details
              here.
            </p>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">${order?.total?.toFixed(2) || "0.00"}</p>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => router.push("/orders")}>View Orders</Button>
            <Button variant="outline" onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
