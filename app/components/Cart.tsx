"use client"

import { useCart } from "../contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { memo, useCallback, useState } from "react"
import DollarTransferAnimation from "./DollarTransferAnimation"
import LoadingOverlay from "./LoadingOverlay"

export const Cart = memo(function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

  const handleRemoveFromCart = useCallback(
    async (id: string) => {
      setLoadingItemId(id)
      // Simulate a network delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      removeFromCart(id)
      setLoadingItemId(null)
    },
    [removeFromCart],
  )

  const handleCheckout = useCallback(async () => {
    setLoading(true)
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    // Here you would normally redirect to checkout page or process payment
    alert("Checkout functionality would go here!")
  }, [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Cart ({cart.reduce((total, item) => total + item.quantity, 0)})</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>Review your items and proceed to checkout</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between items-center mb-2 relative">
              <div>
                <p>{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              {loadingItemId === item._id ? (
                <div className="w-20 h-8 flex items-center justify-center">
                  <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item._id)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="font-bold">Total: ${getCartTotal().toFixed(2)}</p>
        </div>
        <LoadingOverlay isLoading={loading} message="Processing checkout...">
          <Button className="mt-4 w-full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </LoadingOverlay>
      </SheetContent>
    </Sheet>
  )
})
