"use client"

import { useCart } from "../contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { memo, useCallback, useState } from "react"
import DollarTransferAnimation from "./DollarTransferAnimation"
import LoadingOverlay from "./LoadingOverlay"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export const Cart = memo(function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart()
  const [loading, setLoading] = useState(false)
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

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

  const handleQuantityChange = useCallback(
    async (id: string, newQuantity: number) => {
      setLoadingItemId(id)
      // Simulate a network delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      updateQuantity(id, newQuantity)
      setLoadingItemId(null)
    },
    [updateQuantity],
  )

  const handleCheckout = useCallback(async () => {
    setLoading(true)
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    setIsOpen(false)
    router.push("/checkout")
  }, [router])

  const cartCount = getCartCount()
  const cartTotal = getCartTotal()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
          {cartCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>Review your items and proceed to checkout</SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-start space-x-4 py-4 border-b">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>

                    <div className="flex items-center mt-2">
                      {loadingItemId === item._id ? (
                        <div className="w-24 h-8 flex items-center justify-center">
                          <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto"
                        onClick={() => handleRemoveFromCart(item._id)}
                        disabled={loadingItemId === item._id}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-medium text-base">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <LoadingOverlay isLoading={loading} message="Preparing checkout...">
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </LoadingOverlay>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
})
