import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("API: Fetching order details for:", params.id)

  try {
    await connectDB()
    console.log("API: Connected to database")

    const user = await getUserFromToken(req)
    if (!user) {
      console.log("API: User not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    console.log("API: User authenticated:", user._id)

    const order = await Order.findById(params.id).lean()

    if (!order) {
      console.log("API: Order not found:", params.id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== user._id.toString()) {
      console.log("API: Order does not belong to user")
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 })
    }

    console.log("API: Order found and returned")
    return NextResponse.json(order)
  } catch (error) {
    console.error("API: Error fetching order:", error)
    return NextResponse.json(
      { error: "Error fetching order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
