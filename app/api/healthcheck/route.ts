import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"
import Product from "@/models/Product"

export async function GET() {
  console.log("Health check: Starting comprehensive health check...")

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
  }

  try {
    console.log("Health check: Connecting to MongoDB...")
    await connectDB()
    console.log("Health check: Connected to MongoDB")

    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    console.log("Health check: Database status:", dbStatus)

    diagnostics.database = {
      status: dbStatus,
      connectionString: process.env.MONGODB_URI ? "Configured" : "Missing",
    }

    // Test a simple query
    try {
      const productCount = await Product.countDocuments()
      diagnostics.database.productCount = productCount
      console.log(`Health check: Found ${productCount} products`)
    } catch (queryError) {
      console.error("Health check: Error querying products:", queryError)
      diagnostics.database.queryError = queryError instanceof Error ? queryError.message : "Unknown error"
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "System is healthy",
        diagnostics,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Health check: Error connecting to database:", error)

    diagnostics.error = error instanceof Error ? error.message : "Unknown error"
    diagnostics.status = "error"

    return NextResponse.json(
      {
        status: "error",
        message: "System health check failed",
        diagnostics,
      },
      { status: 500 },
    )
  }
}
