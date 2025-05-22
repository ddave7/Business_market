"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import DollarTransferAnimation from "./DollarTransferAnimation"

interface UserData {
  _id: string
  businessName: string
  email: string
}

interface UserMenuProps {
  userData?: UserData | null
}

export function UserMenu({ userData }: UserMenuProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        router.push("/login")
        router.refresh()
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {userData && (
          <div className="px-2 py-1.5 text-sm font-medium border-b mb-1">{userData.businessName || userData.email}</div>
        )}
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <div className="flex items-center">
              <DollarTransferAnimation size="small" dollarsCount={1} speed="fast" />
              <span className="ml-2">Logging out...</span>
            </div>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
