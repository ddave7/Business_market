import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { SignJWT } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export async function POST(req: Request) {
  try {
    await connectDB()
    console.log("Login attempt started")

    const { email, password } = await req.json()
    console.log("Login attempt for email:", email)

    // Find user
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      console.log("Password does not match for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User authenticated successfully:", user._id)

    // Convert ObjectId to string to ensure it's properly stored in the JWT
    const userId = user._id.toString()
    console.log("User ID as string:", userId)

    // Create token
    const token = await new SignJWT({
      userId: userId, // Store as string
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey)

    console.log("JWT token generated")

    // Create the response
    const response = NextResponse.json({
      success: true,
      user: {
        _id: userId,
        businessName: user.businessName,
        email: user.email,
      },
    })

    // Set cookie with strict security options
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    console.log("Auth cookie set in response")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error logging in" }, { status: 500 })
  }
}
