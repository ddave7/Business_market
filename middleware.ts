import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    console.log("Middleware: Incoming request", {
      url: request.url,
      pathname: request.nextUrl.pathname,
    })

    const authToken = request.cookies.get("auth_token")
    console.log("Middleware: Auth token present:", !!authToken)

    // For API routes, check authentication but return JSON responses
    if (request.nextUrl.pathname.startsWith("/api/")) {
      // Allow public API routes without authentication
      if (
        request.nextUrl.pathname === "/api/healthcheck" ||
        request.nextUrl.pathname === "/api/products-client" ||
        request.nextUrl.pathname.startsWith("/api/auth/login") ||
        request.nextUrl.pathname.startsWith("/api/auth/register")
      ) {
        return NextResponse.next()
      }

      // Check authentication for protected API routes
      if (
        !authToken &&
        (request.nextUrl.pathname.startsWith("/api/products") ||
          request.nextUrl.pathname.startsWith("/api/dashboard") ||
          request.nextUrl.pathname.startsWith("/api/upload") ||
          request.nextUrl.pathname.startsWith("/api/upload-base64"))
      ) {
        console.log("Middleware: API request without auth token")
        return NextResponse.json(
          { error: "Authentication required", authenticated: false },
          { status: 401, headers: { "Content-Type": "application/json" } },
        )
      }

      // Allow the API request to proceed
      return NextResponse.next()
    }

    // Protected routes that require authentication
    if (
      !authToken &&
      (request.nextUrl.pathname.startsWith("/products/add") || request.nextUrl.pathname.startsWith("/dashboard"))
    ) {
      console.log("Middleware: Redirecting unauthenticated user to login")
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users away from login/register pages
    if (authToken && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
      console.log("Middleware: Redirecting authenticated user to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    console.log("Middleware: Allowing request to proceed")
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // For API routes, return JSON error
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Internal server error in middleware" },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
    // For other routes, continue to the application which will handle the error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/products/add",
    "/api/products/:path*",
    "/api/auth/:path*",
    "/api/upload",
    "/api/upload-base64",
    "/api/healthcheck",
    "/api/products-client",
  ],
}
