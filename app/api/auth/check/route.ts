import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export async function GET(req: Request) {
  console.log("Auth check API called")

  try {
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    console.log("Auth token present:", !!token)

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    // Verify token
    let payload
    try {
      const verified = await jwtVerify(token, secretKey)
      payload = verified.payload
      console.log("Token verified successfully")
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ authenticated: false, error: "Invalid token" }, { status: 200 })
    }

    if (!payload.userId) {
      console.log("No userId in token payload")
      return NextResponse.json({ authenticated: false, error: "Invalid token format" }, { status: 200 })
    }

    // Connect to database and get user
    try {
      await connectDB()

      // Convert userId to string to ensure proper format
      const userId = typeof payload.userId === "object" ? JSON.stringify(payload.userId) : String(payload.userId)

      // Find user by ID or email
      let user
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId).select("-password").lean()
      } else if (payload.email) {
        user = await User.findOne({ email: payload.email }).select("-password").lean()
      }

      if (!user) {
        console.log("User not found in database")
        return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 200 })
      }

      console.log("User found, authentication successful")
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            _id: user._id,
            email: user.email,
            businessName: user.businessName,
            description: user.description,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json({ authenticated: false, error: "Database error" }, { status: 200 })
    }
  } catch (error) {
    console.error("Unexpected error in auth check:", error)
    return NextResponse.json({ authenticated: false, error: "Server error" }, { status: 200 })
  }
}

import mongoose from "mongoose"
