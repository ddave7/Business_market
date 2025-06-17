"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "../contexts/CartContext"
import { ShoppingCart, Check } from "lucide-react"
import DollarTransferAnimation from "./DollarTransferAnimation"

interface AddToCartButtonProps {
  product: any
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
}

export default function AddToCartButton({
  product,
  size = "default",
  variant = "default",
  className = "",
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)

    // Create cart item from product
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      stock: product.stock,
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Add to cart
    addToCart(cartItem)

    setLoading(false)
    setAdded(true)

    // Reset added state after 2 seconds
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const alreadyInCart = isInCart(product._id)

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleAddToCart}
      disabled={loading || alreadyInCart || product.stock <= 0}
    >
      {loading ? (
        <div className="flex items-center">
          <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
          <span className="ml-2">Adding...</span>
        </div>
      ) : added ? (
        <div className="flex items-center">
          <Check className="h-5 w-5 mr-2" />
          Added to Cart
        </div>
      ) : alreadyInCart ? (
        <div className="flex items-center">
          <Check className="h-5 w-5 mr-2" />
          In Cart
        </div>
      ) : product.stock <= 0 ? (
        "Out of Stock"
      ) : (
        <div className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </div>
      )}
    </Button>
  )
}
