import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { SignJWT } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export async function POST(req: Request) {
  try {
    console.log("Login attempt started")

    // Parse request body
    let email, password
    try {
      const body = await req.json()
      email = body.email
      password = body.password
      console.log("Request body parsed, email:", email)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Connect to database
    try {
      await connectDB()
      console.log("Connected to database")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 })
    }

    // Find user
    let user
    try {
      // Use case-insensitive email matching
      user = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      }).select("+password")
      console.log("User lookup result:", user ? "Found" : "Not found")
    } catch (findError) {
      console.error("Error finding user:", findError)
      return NextResponse.json({ error: "Error finding user" }, { status: 500 })
    }

    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    let isMatch
    try {
      isMatch = await user.matchPassword(password)
      console.log("Password match result:", isMatch)
    } catch (passwordError) {
      console.error("Error checking password:", passwordError)
      return NextResponse.json({ error: "Error verifying password" }, { status: 500 })
    }

    if (!isMatch) {
      console.log("Password does not match for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User authenticated successfully:", user._id)

    // Convert ObjectId to string
    const userId = user._id.toString()

    // Create token
    let token
    try {
      token = await new SignJWT({
        userId: userId,
        email: user.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // Extended to 7 days
        .sign(secretKey)
      console.log("JWT token generated")
    } catch (tokenError) {
      console.error("Error generating token:", tokenError)
      return NextResponse.json({ error: "Error generating authentication token" }, { status: 500 })
    }

    // Create the response with explicit no-cache headers
    const response = NextResponse.json(
      {
        success: true,
        user: {
          _id: userId,
          businessName: user.businessName,
          email: user.email,
        },
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )

    // Set cookie with longer expiration
    try {
      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Changed from strict to lax for better compatibility
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
      console.log("Auth cookie set in response")
    } catch (cookieError) {
      console.error("Error setting cookie:", cookieError)
      return NextResponse.json({ error: "Error setting authentication cookie" }, { status: 500 })
    }

    return response
  } catch (error) {
    console.error("Unexpected login error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred during login",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
