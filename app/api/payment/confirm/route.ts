import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Stripe from "stripe"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    // Connect to database
    await connectDB()

    // Get session ID from request
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId })
    if (existingOrder) {
      return NextResponse.json({ order: existingOrder })
    }

    // Get product details from metadata
    const productDetails = JSON.parse(session.metadata?.productDetails || "[]")
    if (!productDetails.length) {
      return NextResponse.json({ error: "No product details found" }, { status: 400 })
    }

    // Calculate total
    const total = productDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Create order
    const order = await Order.create({
      user: session.metadata?.userId,
      items: productDetails,
      total,
      status: "paid",
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
      shippingAddress: session.shipping?.address || {},
      customerName: session.shipping?.name || session.customer_details?.name || "",
      customerEmail: session.customer_details?.email || "",
    })

    // Update product stock
    for (const item of productDetails) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        to: order.customerEmail,
        order: {
          id: order._id.toString(),
          items: order.items,
          total: order.total,
          date: order.createdAt,
        },
      })
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
    }

    // Create notifications for businesses
    try {
      // Group items by business
      const businessItems = {}
      for (const item of productDetails) {
        if (!businessItems[item.business]) {
          businessItems[item.business] = []
        }
        businessItems[item.business].push(item)
      }

      // Create notification for each business
      for (const [businessId, items] of Object.entries(businessItems)) {
        await createNotification({
          user: businessId,
          type: "new_order",
          title: "New Order Received",
          message: `You have received a new order with ${items.length} product(s).`,
          data: {
            orderId: order._id.toString(),
            items,
          },
        })
      }
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError)
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
