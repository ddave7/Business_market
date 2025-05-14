"use client"

import type React from "react"

import { createContext, useContext, useCallback } from "react"
import { useAuthStatus, loginUser, logoutUser } from "@/lib/auth-client"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshAuthState: () => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, refreshAuth } = useAuthStatus()

  const login = useCallback(async (email: string, password: string) => {
    return await loginUser(email, password)
  }, [])

  const logout = useCallback(async () => {
    return await logoutUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        refreshAuthState: refreshAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
