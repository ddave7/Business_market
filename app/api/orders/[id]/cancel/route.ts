import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { getUserFromToken } from "@/lib/auth"
import Product from "@/models/Product"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  console.log(`API: Cancelling order with ID: ${params.id}`)

  try {
    await connectDB()
    console.log("API: Connected to database")

    const user = await getUserFromToken(req)
    if (!user) {
      console.log("API: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    console.log("API: User authenticated:", user._id)

    const order = await Order.findById(params.id)

    if (!order) {
      console.log(`API: Order with ID ${params.id} not found`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== user._id.toString()) {
      console.log("API: Order does not belong to user")
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 })
    }

    // Check if the order can be cancelled
    if (order.status === "cancelled") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 })
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return NextResponse.json({ error: "Cannot cancel an order that has been shipped or delivered" }, { status: 400 })
    }

    // Get the reason for cancellation from the request body
    const { reason } = await req.json().catch(() => ({}))

    // Update order status to cancelled
    const previousStatus = order.status
    order.status = "cancelled"
    order.cancellationReason = reason || "Cancelled by customer"
    order.cancelledAt = new Date()

    await order.save()
    console.log(`API: Order ${params.id} cancelled successfully`)

    // If the order was in processing status, restore the product stock
    if (previousStatus === "processing" || previousStatus === "pending") {
      try {
        // For each item in the order, restore the stock
        for (const item of order.items) {
          if (item.product) {
            const product = await Product.findById(item.product)
            if (product) {
              product.stock += item.quantity
              await product.save()
              console.log(`API: Restored ${item.quantity} units to product ${product._id}`)
            }
          }
        }
      } catch (stockError) {
        console.error("API: Error restoring product stock:", stockError)
        // Continue with the cancellation even if stock restoration fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        _id: order._id,
        status: order.status,
        cancelledAt: order.cancelledAt,
      },
    })
  } catch (error) {
    console.error(`API: Error cancelling order ${params.id}:`, error)
    return NextResponse.json(
      { error: "Error cancelling order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
