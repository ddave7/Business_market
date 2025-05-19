"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SimpleCheckoutPage() {
  const router = useRouter()
  const { cartItems, clearCart, calculateTotal } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  })

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate a random order ID
      const orderId = Math.random().toString(36).substring(2, 15)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Clear cart
      clearCart()

      // Redirect to success page
      router.push(`/checkout/success?test_order=${orderId}`)
    } catch (error) {
      console.error("Error processing test checkout:", error)
      setIsSubmitting(false)
    }
  }

  // Calculate totals
  const subtotal = calculateTotal()
  const shipping = 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-4">Add some products to your cart before proceeding to checkout.</p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Checkout</h1>
      <p className="mb-6 text-muted-foreground">
        This is a test checkout that doesn't process real payments. Use it to test the checkout flow.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping</p>
                    <p>${shipping.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tax</p>
                    <p>${tax.toFixed(2)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      name="expiry"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      name="cvc"
                      placeholder="123"
                      value={formData.cvc}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
