"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cart } from "./Cart"
import { UserMenu } from "./UserMenu"
import { Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import DollarTransferAnimation from "./DollarTransferAnimation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "../contexts/AuthContext"

export default function Header() {
  const { user, isLoading, isAuthenticated, refreshAuthState } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleNavigation = useCallback(
    (path: string) => {
      setIsMobileMenuOpen(false)
      router.push(path)
    },
    [router],
  )

  // Force refresh auth state when header mounts
  useEffect(() => {
    refreshAuthState()
  }, [refreshAuthState])

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
            ) : isAuthenticated ? (
              <UserMenu userData={user} />
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
            ) : isAuthenticated ? (
              <UserMenu userData={user} />
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

import { useEffect } from "react"
