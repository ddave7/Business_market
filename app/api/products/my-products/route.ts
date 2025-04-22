import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    await connectDB()

    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const products = await Product.find({ business: user._id }).sort({ createdAt: -1 }).limit(10).lean()

    return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) })
  } catch (error) {
    console.error("Error fetching my products:", error)
    return NextResponse.json(
      {
        error: "Error fetching products",
        products: [],
      },
      { status: 500 },
    )
  }
}
