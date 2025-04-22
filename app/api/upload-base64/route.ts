import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

// Set proper headers for JSON response
const jsonHeaders = {
  "Content-Type": "application/json",
}

export async function POST(request: Request) {
  console.log("API: Upload-base64 route called")

  try {
    // Check authentication
    try {
      const user = await getUserFromToken(request)
      if (!user) {
        console.log("API: User not authenticated")
        return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: jsonHeaders })
      }
      console.log("API: User authenticated:", user._id)
    } catch (authError) {
      console.error("API: Authentication error:", authError)
      return NextResponse.json(
        { error: "Authentication failed", details: authError instanceof Error ? authError.message : "Unknown error" },
        { status: 401, headers: jsonHeaders },
      )
    }

    // Parse request body
    let data
    try {
      data = await request.json()
      console.log("API: Base64 data received")
    } catch (parseError) {
      console.error("API: Error parsing request body:", parseError)
      return NextResponse.json(
        { error: "Invalid request body", details: parseError instanceof Error ? parseError.message : "Unknown error" },
        { status: 400, headers: jsonHeaders },
      )
    }

    // Validate base64 data
    if (!data.base64Data) {
      console.log("API: No base64 data provided")
      return NextResponse.json({ error: "No image data provided" }, { status: 400, headers: jsonHeaders })
    }

    // Validate file type
    const fileType = data.fileType || "image/jpeg"
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(fileType)) {
      console.log(`API: Invalid file type: ${fileType}`)
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed." },
        { status: 400, headers: jsonHeaders },
      )
    }

    // Generate a placeholder URL with the data
    // In a real app, you would upload this to a cloud storage service like AWS S3, Cloudinary, etc.
    const timestamp = Date.now()
    const fileName = `${timestamp}-image.${fileType.split("/")[1]}`

    // For demo purposes, we'll just return the base64 data as a data URL
    // In production, replace this with a cloud storage upload
    const dataUrl = `data:${fileType};base64,${data.base64Data}`

    console.log(`API: Generated data URL for image`)

    return NextResponse.json(
      {
        fileUrl: dataUrl,
        fileName: fileName,
      },
      { headers: jsonHeaders },
    )
  } catch (error) {
    console.error("API: Unexpected error in upload-base64 route:", error)
    return NextResponse.json(
      { error: "Unexpected error during upload", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: jsonHeaders },
    )
  }
}
