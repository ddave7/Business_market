"use server"

import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"

export async function deleteProduct(productId: string) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    await connectDB()

    // Find the product and check if the current user is the seller
    const product = await Product.findById(productId)

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    if (product.seller.toString() !== user._id.toString()) {
      return { success: false, error: "You are not authorized to delete this product" }
    }

    // Delete the product
    await Product.findByIdAndDelete(productId)

    // Revalidate the dashboard page
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}
