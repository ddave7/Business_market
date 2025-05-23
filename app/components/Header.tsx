"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cart } from "./Cart"
import { UserMenu } from "./UserMenu"
import { Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import DollarTransferAnimation from "./DollarTransferAnimation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [checkError, setCheckError] = useState(false)
  const router = useRouter()

  const checkLoginStatus = useCallback(async () => {
    setIsLoading(true)
    setCheckError(false)
    try {
      const res = await fetch("/api/auth/check", {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!res.ok) {
        throw new Error("Failed to check authentication status")
      }

      const data = await res.json()
      setIsLoggedIn(data.authenticated)

      // Store user data if available
      if (data.authenticated && data.user) {
        setUserData(data.user)
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.error("Error checking login status:", error)
      setIsLoggedIn(false)
      setUserData(null)
      setCheckError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkLoginStatus()

    // Set up an interval to periodically check login status
    const intervalId = setInterval(
      () => {
        checkLoginStatus()
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(intervalId)
  }, [checkLoginStatus])

  const handleNavigation = useCallback(
    (path: string) => {
      setIsMobileMenuOpen(false)
      router.push(path)
    },
    [router],
  )

  return (
    <header className="bg-background border-b shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-foreground">
            Commercial Marketplace
          </Link>
          <div className="hidden md:flex space-x-4 items-center">
            <Button variant="ghost" onClick={() => handleNavigation("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => handleNavigation("/products")}>
              Products
            </Button>
            <Button variant="ghost" onClick={() => handleNavigation("/register")}>
              Register Business
            </Button>
            {isLoading ? (
              <div className="w-20 h-8">
                <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
              </div>
            ) : checkError ? (
              <Button onClick={checkLoginStatus} variant="outline" size="sm">
                Retry
              </Button>
            ) : isLoggedIn ? (
              <UserMenu userData={userData} onLogout={checkLoginStatus} />
            ) : (
              <Button onClick={() => handleNavigation("/login")}>Login</Button>
            )}
            <ThemeToggle />
            <Cart />
          </div>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu />
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden space-y-2 bg-background border rounded-md p-3">
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/products")}>
              Products
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/register")}>
              Register Business
            </Button>
            {isLoading ? (
              <div className="w-full h-10 flex justify-center">
                <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
              </div>
            ) : checkError ? (
              <Button onClick={checkLoginStatus} className="w-full">
                Retry Authentication Check
              </Button>
            ) : isLoggedIn ? (
              <UserMenu userData={userData} onLogout={checkLoginStatus} />
            ) : (
              <Button className="w-full" onClick={() => handleNavigation("/login")}>
                Login
              </Button>
            )}
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
            <Cart />
          </div>
        )}
      </nav>
    </header>
  )
}
