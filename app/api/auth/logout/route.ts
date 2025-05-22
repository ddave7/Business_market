import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Logout request received")

    // Create response
    const response = NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )

    // Clear the auth cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    console.log("Auth cookie cleared")
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Error logging out" }, { status: 500 })
  }
}
