"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, CreditCard, Wallet, Building } from "lucide-react"
import DollarTransferAnimation from "../components/DollarTransferAnimation"

interface OrderReviewProps {
  orderData: any
  cart: any[]
  onBack: () => void
  onPlaceOrder: () => void
  isLoading: boolean
}

export default function OrderReview({ orderData, cart, onBack, onPlaceOrder, isLoading }: OrderReviewProps) {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
  const total = subtotal + tax + shipping

  // Get payment method icon
  const getPaymentIcon = () => {
    switch (orderData.paymentMethod) {
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

  // Get payment method display name
  const getPaymentMethodName = () => {
    switch (orderData.paymentMethod) {
      case "credit_card":
        return "Credit Card"
      case "paypal":
        return "PayPal"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return "Unknown"
    }
  }

  // Get masked card number
  const getMaskedCardNumber = () => {
    if (orderData.paymentMethod !== "credit_card" || !orderData.paymentDetails.cardNumber) {
      return null
    }

    const lastFour = orderData.paymentDetails.cardNumber.slice(-4)
    return `•••• •••• •••• ${lastFour}`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Shipping Address
        </h3>
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="font-medium">{orderData.shippingAddress.fullName}</p>
          <p>{orderData.shippingAddress.address}</p>
          <p>
            {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}
          </p>
          <p>{orderData.shippingAddress.country}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center">
          {getPaymentIcon()}
          Payment Method
        </h3>
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="font-medium">{getPaymentMethodName()}</p>
          {orderData.paymentMethod === "credit_card" && (
            <>
              <p>{getMaskedCardNumber()}</p>
              <p>{orderData.paymentDetails.cardName}</p>
              <p>Expires: {orderData.paymentDetails.expiryDate}</p>
            </>
          )}
          {orderData.paymentMethod === "paypal" && (
            <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment.</p>
          )}
          {orderData.paymentMethod === "bank_transfer" && (
            <p className="text-sm text-muted-foreground">
              Bank transfer details will be provided after you place your order.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Order Summary</h3>
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back to Payment
        </Button>
        <Button onClick={onPlaceOrder} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center">
              <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  )
}
