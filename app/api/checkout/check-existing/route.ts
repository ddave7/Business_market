import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Get session ID from query params
    const url = new URL(req.url)
    const sessionId = url.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if an order with this session ID already exists
    const existingOrder = await Order.findOne({
      "paymentDetails.sessionId": sessionId,
      user: user._id,
    })

    if (existingOrder) {
      console.log("Found existing order for session:", sessionId)
      return NextResponse.json({
        exists: true,
        orderId: existingOrder._id,
      })
    }

    return NextResponse.json({
      exists: false,
    })
  } catch (error) {
    console.error("Error checking existing order:", error)
    return NextResponse.json(
      { error: "Failed to check existing order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
