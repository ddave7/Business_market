import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-server"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export const dynamic = "force-dynamic" // Disable caching for this route

export async function GET() {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    console.error("Error in auth check route:", error)
    return NextResponse.json({ error: "Authentication check failed", authenticated: false }, { status: 500 })
  }
}
