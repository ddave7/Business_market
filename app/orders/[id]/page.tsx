"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import DollarTransferAnimation from "../../components/DollarTransferAnimation"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/orders/${params.id}`, {
          credentials: "include",
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.status}`)
        }

        const data = await res.json()
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

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true)

      const res = await fetch(`/api/orders/${params.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason }),
        credentials: "include",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to cancel order")
      }

      const data = await res.json()

      // Update the order in the state
      setOrder((prev) => ({
        ...prev,
        status: "cancelled",
        cancellationReason: cancelReason,
        cancelledAt: new Date().toISOString(),
      }))

      setCancelDialogOpen(false)
    } catch (err) {
      console.error("Error cancelling order:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsCancelling(false)
    }
  }

  // Check if order can be cancelled
  const canCancel = order && (order.status === "pending" || order.status === "processing")

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
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">
            Order #{order._id.substring(order._id.length - 8)} • Placed on{" "}
            {format(new Date(order.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2">
          {getStatusBadge(order.status)}
          {canCancel && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="cancel-reason">Reason for cancellation (optional)</Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Please provide a reason for cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>
                    Keep Order
                  </Button>
                  <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {order.status === "cancelled" && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertDescription>
            <div className="font-medium">This order was cancelled</div>
            {order.cancellationReason && <div className="mt-1">{order.cancellationReason}</div>}
            {order.cancelledAt && (
              <div className="text-sm mt-1">Cancelled on {format(new Date(order.cancelledAt), "MMMM d, yyyy")}</div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-800">Tracking Number: {order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Payment Method: </span>
                  {order.paymentMethod === "credit_card" && "Credit Card"}
                  {order.paymentMethod === "paypal" && "PayPal"}
                  {order.paymentMethod === "bank_transfer" && "Bank Transfer"}
                </p>

                {order.paymentDetails?.cardLastFour && (
                  <p>
                    <span className="font-medium">Card: </span>
                    {order.paymentDetails.cardBrand} ending in {order.paymentDetails.cardLastFour}
                  </p>
                )}

                {order.paymentDetails?.transactionId && (
                  <p>
                    <span className="font-medium">Transaction ID: </span>
                    {order.paymentDetails.transactionId}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/orders">Back to Orders</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
