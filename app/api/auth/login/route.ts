import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    console.log("Login attempt started")
    await connectDB()
    console.log("Connected to MongoDB")

    const { email, password } = await req.json()
    console.log("Received login data for email:", email)

    // Find user by email - case insensitive
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } }).select("+password")
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    console.log("Password match:", isMatch ? "Yes" : "No")

    if (!isMatch) {
      console.log("Password does not match")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "30d",
    })
    console.log("JWT token created")

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })
    console.log("Auth cookie set")

    return NextResponse.json({
      _id: user._id,
      businessName: user.businessName,
      email: user.email,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Error logging in", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
