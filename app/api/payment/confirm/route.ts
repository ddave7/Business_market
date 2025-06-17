import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { retrievePaymentIntent } from "@/lib/stripe"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"

export async function POST(req: Request) {
  try {
    await connectDB()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get payment details from request
    const { paymentIntentId, orderId } = await req.json()

    if (!paymentIntentId || !orderId) {
      return NextResponse.json({ error: "Missing payment intent ID or order ID" }, { status: 400 })
    }

    // Retrieve payment intent to verify payment status
    const paymentIntent = await retrievePaymentIntent(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "Payment not completed",
          status: paymentIntent.status,
        },
        { status: 400 },
      )
    }

    // Update order with payment details
    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 })
    }

    // Update order with payment details
    order.status = "processing"
    order.paymentDetails = {
      transactionId: paymentIntentId,
      cardBrand: paymentIntent.payment_method_details?.card?.brand || "unknown",
      cardLastFour: paymentIntent.payment_method_details?.card?.last4 || "xxxx",
    }

    await order.save()

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
      },
    })
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json(
      { error: "Failed to confirm payment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
