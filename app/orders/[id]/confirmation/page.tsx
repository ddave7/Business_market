"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"
import { CheckCircle2, CreditCard, Wallet, Building } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching order details for:", params.id)

        const res = await fetch(`/api/orders/${params.id}`, {
          credentials: "include",
        })

        if (!res.ok) {
          console.error("Error response from API:", res.status)
          throw new Error(`Failed to fetch order: ${res.status}`)
        }

        const data = await res.json()
        console.log("Order data received:", data)
        setOrder(data)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  const getPaymentIcon = (method) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-5 w-5 mr-2 text-primary" />
      case "paypal":
        return <Wallet className="h-5 w-5 mr-2 text-blue-500" />
      case "bank_transfer":
        return <Building className="h-5 w-5 mr-2 text-green-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <DollarTransferAnimation message="Loading order details..." size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>
            Thank you for your order. We've received your payment and will process your order shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Order Information</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{params.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Processing"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <p className="font-medium capitalize">{order?.status || "Processing"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium text-green-600">
                    {order?.paymentMethod === "credit_card" ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-3">
                {order?.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${order?.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${order?.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {order?.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${order?.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium mt-2">
                    <span>Total</span>
                    <span>${order?.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>{order?.shippingAddress.fullName}</p>
                <p>{order?.shippingAddress.address}</p>
                <p>
                  {order?.shippingAddress.city}, {order?.shippingAddress.state} {order?.shippingAddress.postalCode}
                </p>
                <p>{order?.shippingAddress.country}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  {getPaymentIcon(order?.paymentMethod)}
                  <span className="capitalize">{order?.paymentMethod?.replace("_", " ") || "Not specified"}</span>
                </div>
                {order?.paymentDetails?.cardLastFour && (
                  <p className="mt-1 text-sm text-gray-600">
                    {order.paymentDetails.cardBrand} ending in {order.paymentDetails.cardLastFour}
                  </p>
                )}
                {order?.paymentDetails?.transactionId && (
                  <p className="mt-1 text-sm text-gray-600">Transaction ID: {order.paymentDetails.transactionId}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
