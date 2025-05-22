import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import User from "@/models/User"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export async function getUserFromToken() {
  try {
    // Get token from cookies
    let token
    try {
      const cookieStore = cookies()
      token = cookieStore.get("auth_token")?.value
    } catch (cookieError) {
      console.error("Error accessing cookies:", cookieError)
      throw new Error("Failed to access authentication cookies")
    }

    if (!token) {
      console.log("No auth token found in cookies")
      return null
    }

    // Verify token
    let payload
    try {
      const verified = await jwtVerify(token, secretKey)
      payload = verified.payload
      console.log("Token verified, payload:", payload)
    } catch (jwtError) {
      console.error("Error verifying token:", jwtError)
      throw new Error("Invalid authentication token")
    }

    if (!payload.userId) {
      console.log("No userId found in token payload")
      return null
    }

    // Connect to database with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        await connectDB()
        break // Connection successful, exit the retry loop
      } catch (dbError) {
        retries--
        if (retries === 0) {
          console.error("Database connection error after retries:", dbError)
          throw new Error("Failed to connect to database")
        }
        console.log(`Database connection failed, retrying... (${retries} attempts left)`)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retrying
      }
    }

    // Find user - Convert userId to string to ensure it's properly formatted
    try {
      // Make sure userId is a string before using it
      const userId = typeof payload.userId === "object" ? JSON.stringify(payload.userId) : String(payload.userId)

      console.log("Looking up user with ID:", userId)

      // Try to find the user by ID
      let user
      try {
        // If userId is a valid ObjectId, use it directly
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findById(userId).select("-password").lean()
        } else {
          // If not a valid ObjectId, try to find by email instead
          console.log("Invalid ObjectId, trying to find user by email")
          if (payload.email) {
            user = await User.findOne({ email: payload.email }).select("-password").lean()
          }
        }
      } catch (findError) {
        console.error("Error finding user by ID:", findError)
        // Try to find by email as fallback
        if (payload.email) {
          console.log("Trying to find user by email instead:", payload.email)
          user = await User.findOne({ email: payload.email }).select("-password").lean()
        } else {
          throw findError
        }
      }

      if (!user) {
        console.log("User not found in database")
        return null
      }

      // Ensure user._id is a string
      if (user._id && typeof user._id !== "string") {
        user._id = user._id.toString()
      }

      return user
    } catch (userError) {
      console.error("Error finding user:", userError)
      throw new Error("Failed to retrieve user information")
    }
  } catch (error) {
    console.error("Unexpected error in getUserFromToken:", error)
    throw error
  }
}
