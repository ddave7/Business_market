import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    console.log("Registration attempt started")
    await connectDB()
    console.log("Connected to MongoDB")

    const { businessName, email, password, description } = await req.json()
    console.log("Received registration data:", { businessName, email, description })

    // Check if user exists - case insensitive email check
    const userExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } })
    console.log("User exists check:", userExists ? "Yes" : "No")

    if (userExists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user
    try {
      console.log("Attempting to create user")
      const user = await User.create({
        businessName,
        password,
        email: email.toLowerCase(), // Store email in lowercase
        description,
      })
      console.log("User created successfully:", user._id)

      return NextResponse.json(
        {
          _id: user._id,
          businessName: user.businessName,
          email: user.email,
        },
        { status: 201 },
      )
    } catch (error) {
      console.error("Error creating user:", error)
      if (error instanceof Error && "errors" in (error as any)) {
        const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
        console.log("Validation errors:", validationErrors)
        return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Unexpected registration error:", error)
    return NextResponse.json(
      { error: "Error registering user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
