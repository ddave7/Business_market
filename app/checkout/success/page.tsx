"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCart } from "@/app/contexts/CartContext"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const testOrder = searchParams.get("test_order")
  const { clearCart } = useCart()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart()

    // If this is a test order, create mock order details
    if (testOrder) {
      setOrderDetails({
        id: testOrder,
        amount: "Test Order",
        status: "success",
        isTestOrder: true,
      })
      setLoading(false)
      return
    }

    // Otherwise, verify the real Stripe session
    if (!sessionId) {
      setError("No session ID provided")
      setLoading(false)
      return
    }

    async function verifySession() {
      try {
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)

        if (!response.ok) {
          throw new Error("Failed to verify checkout session")
        }

        const data = await response.json()
        setOrderDetails(data)
      } catch (err) {
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId, testOrder, clearCart])

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processing Your Order</CardTitle>
            <CardDescription>Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Checkout Error</CardTitle>
            <CardDescription>We encountered a problem with your order</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <Link href="/checkout">
                <Button>Try Again</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>
            {orderDetails?.isTestOrder
              ? "Your test order has been processed successfully"
              : "Your payment has been processed successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Order Reference</p>
            <p className="font-medium">{orderDetails?.id || "N/A"}</p>
          </div>

          {!orderDetails?.isTestOrder && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="font-medium">${orderDetails?.amount || "N/A"}</p>
            </div>
          )}

          {orderDetails?.isTestOrder && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">This is a test order. No actual payment was processed.</p>
            </div>
          )}

          <div className="flex justify-center space-x-4 pt-4">
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="/orders">
              <Button>View Orders</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
