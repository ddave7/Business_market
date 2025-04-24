import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    // Test database connection
    console.log("Testing database connection...")
    await connectDB()
    console.log("Database connection successful")

    // Check if User model is registered
    const modelNames = mongoose.modelNames()
    console.log("Registered models:", modelNames)
    const hasUserModel = modelNames.includes("User")

    // Check MongoDB connection status
    const connectionState = mongoose.connection.readyState
    const connectionStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    return NextResponse.json({
      success: true,
      database: {
        connected: connectionState === 1,
        state: connectionStates[connectionState as keyof typeof connectionStates] || "unknown",
      },
      models: {
        registered: modelNames,
        hasUserModel,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
    })
  } catch (error) {
    console.error("Login test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
