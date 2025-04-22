import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { mkdir } from "fs/promises"
import { getUserFromToken } from "@/lib/auth"

// Set proper headers for JSON response
const jsonHeaders = {
  "Content-Type": "application/json",
}

export async function POST(request: Request) {
  console.log("API: Upload route called")

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

    // Parse form data
    let data
    try {
      data = await request.formData()
      console.log("API: Form data received")
    } catch (formError) {
      console.error("API: Error parsing form data:", formError)
      return NextResponse.json(
        { error: "Invalid form data", details: formError instanceof Error ? formError.message : "Unknown error" },
        { status: 400, headers: jsonHeaders },
      )
    }

    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      console.log("API: No file uploaded")
      return NextResponse.json({ error: "No file uploaded" }, { status: 400, headers: jsonHeaders })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      console.log(`API: Invalid file type: ${file.type}`)
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed." },
        { status: 400, headers: jsonHeaders },
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log(`API: File too large: ${file.size} bytes`)
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400, headers: jsonHeaders })
    }

    // Convert file to buffer
    let buffer
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log(`API: File converted to buffer, size: ${buffer.length} bytes`)
    } catch (bufferError) {
      console.error("API: Error converting file to buffer:", bufferError)
      return NextResponse.json(
        {
          error: "Error processing file",
          details: bufferError instanceof Error ? bufferError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public/uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log(`API: Created uploads directory: ${uploadsDir}`)
    } catch (mkdirError) {
      console.error("API: Error creating uploads directory:", mkdirError)
      // Continue if directory already exists
    }

    const filepath = path.join(uploadsDir, filename)

    try {
      // Write file to disk
      await writeFile(filepath, buffer)
      console.log(`API: File saved to ${filepath}`)

      // Return the URL path to the file
      return NextResponse.json({ fileUrl: `/uploads/${filename}` }, { headers: jsonHeaders })
    } catch (writeError) {
      console.error("API: Error saving file:", writeError)
      return NextResponse.json(
        {
          error: "Error saving file to disk",
          details: writeError instanceof Error ? writeError.message : "Unknown error",
        },
        { status: 500, headers: jsonHeaders },
      )
    }
  } catch (error) {
    console.error("API: Unexpected error in upload route:", error)
    return NextResponse.json(
      { error: "Unexpected error during upload", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: jsonHeaders },
    )
  }
}
