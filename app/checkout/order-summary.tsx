"use client"

import { useCart } from "../contexts/CartContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface OrderSummaryProps {
  subtotal?: number
  tax?: number
  shipping?: number
  total?: number
}

export default function OrderSummary({ subtotal, tax, shipping, total }: OrderSummaryProps) {
  const { cart, getCartTotal } = useCart()

  // Use provided values or calculate from cart
  const calculatedSubtotal = subtotal !== undefined ? subtotal : getCartTotal()
  const calculatedTax = tax !== undefined ? tax : calculatedSubtotal * 0.08
  const calculatedShipping = shipping !== undefined ? shipping : calculatedSubtotal > 100 ? 0 : 10
  const calculatedTotal = total !== undefined ? total : calculatedSubtotal + calculatedTax + calculatedShipping

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center space-x-4">
                <div className="relative h-16 w-16 overflow-hidden rounded border">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${calculatedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (8%)</span>
              <span>${calculatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>
                {calculatedShipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${calculatedShipping.toFixed(2)}`
                )}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${calculatedTotal.toFixed(2)}</span>
          </div>

          {calculatedShipping === 0 && (
            <p className="text-sm text-green-600 mt-2">Free shipping applied on orders over $100</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
