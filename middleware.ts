import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/products/add", "/products/edit", "/checkout", "/orders"]

// Define routes that should redirect authenticated users
const authRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value

  // Check if the route is protected and user is not authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const url = new URL(`/login?from=${pathname}`, request.url)
    return NextResponse.redirect(url)
  }

  // Check if the route is an auth route and user is authenticated
  if (authRoutes.includes(pathname) && token) {
    const url = new URL("/dashboard", request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
