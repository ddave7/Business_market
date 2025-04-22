"use client"

import { useEffect } from "react"

export default function LoginHelper() {
  useEffect(() => {
    // Check if we're on the login page but already authenticated
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check", {
          credentials: "include",
          cache: "no-store",
        })
        const data = await res.json()

        if (data.authenticated) {
          console.log("Already authenticated, redirecting to dashboard")
          window.location.href = "/dashboard"
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkAuth()
  }, [])

  return null
}
