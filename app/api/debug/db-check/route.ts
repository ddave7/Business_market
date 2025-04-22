import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Product from "@/models/Product"

export async function GET(req: Request) {
  try {
    await connectDB()
    console.log("Connected to MongoDB for debug check")

    const userCount = await User.countDocuments()
    const productCount = await Product.countDocuments()

    const sampleUser = await User.findOne().select("-password")
    const sampleProduct = await Product.findOne()

    return NextResponse.json(
      {
        userCount,
        productCount,
        sampleUser,
        sampleProduct,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error checking database:", error)
    return NextResponse.json({ error: "Error checking database" }, { status: 500 })
  }
}
