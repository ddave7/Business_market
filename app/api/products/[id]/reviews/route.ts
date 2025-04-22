import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { rating, comment } = await req.json()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const review = {
      user: user._id,
      rating,
      comment,
    }

    product.reviews.push(review)

    // Calculate new average rating
    const totalRating = product.reviews.reduce((sum, item) => sum + item.rating, 0)
    product.averageRating = totalRating / product.reviews.length

    await product.save()

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ error: "Error adding review" }, { status: 500 })
  }
}
