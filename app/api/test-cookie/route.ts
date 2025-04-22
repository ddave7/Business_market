import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()

  // Set a test cookie
  const response = NextResponse.json({
    message: "Cookie test endpoint",
    existingCookies: allCookies.map((c) => c.name),
    authTokenPresent: !!cookieStore.get("auth_token"),
  })

  response.cookies.set("test_cookie", "cookie_value", {
    httpOnly: true,
    maxAge: 60 * 60, // 1 hour
    path: "/",
  })

  return response
}
