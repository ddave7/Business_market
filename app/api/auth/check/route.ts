import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export const dynamic = "force-dynamic" // Disable caching for this route

export async function GET(req: Request) {
  try {
    console.log("Auth check request received")

    const user = await getUserFromToken(req)

    if (!user) {
      console.log("Auth check: No authenticated user found")
      return NextResponse.json(
        { authenticated: false },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    }

    console.log("Auth check: User authenticated", user._id)
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          _id: user._id,
          email: user.email,
          businessName: user.businessName,
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
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Error checking authentication status",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
