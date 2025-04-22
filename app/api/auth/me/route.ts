import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export async function GET(req: Request) {
  try {
    // Get token directly from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      console.log("API /me: No auth token found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    let payload
    try {
      const verified = await jwtVerify(token, secretKey)
      payload = verified.payload
    } catch (jwtError) {
      console.error("API /me: Error verifying token:", jwtError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!payload.userId) {
      console.log("API /me: No userId found in token payload")
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Find user
    const user = await User.findById(payload.userId).select("-password").lean()

    if (!user) {
      console.log("API /me: User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: user._id,
      businessName: user.businessName,
      email: user.email,
      description: user.description,
    })
  } catch (error) {
    console.error("API /me: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
