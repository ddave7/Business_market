import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserFromToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Get user data from token
    const user = await getUserFromToken(req)

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Return user data along with authentication status
    return NextResponse.json({
      authenticated: true,
      user: {
        _id: user._id.toString(),
        businessName: user.businessName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication check failed",
      },
      { status: 500 },
    )
  }
}
