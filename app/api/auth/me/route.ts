import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-server"

export const dynamic = "force-dynamic" // Disable caching for this route

export async function GET() {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ error: "Failed to get user data" }, { status: 500 })
  }
}
