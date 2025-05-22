"use client"

import type React from "react"

import { createContext, useContext, useCallback, useState, useEffect } from "react"
import { useAuthStatus, loginUser, logoutUser } from "@/lib/auth-client"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshAuthState: () => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
}

// Create a default context value to prevent the "must be used within a provider" error
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuthState: () => {},
  login: async () => ({ success: false, error: "Not initialized" }),
  logout: async () => ({ success: false, error: "Not initialized" }),
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use state to track if we're on the client side
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only use the hook on the client side
  const auth = useAuthStatus()

  const login = useCallback(async (email: string, password: string) => {
    return await loginUser(email, password)
  }, [])

  const logout = useCallback(async () => {
    return await logoutUser()
  }, [])

  // Use the real values only when mounted (client-side)
  const contextValue = isMounted
    ? {
        user: auth.user,
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        refreshAuthState: auth.refreshAuth,
        login,
        logout,
      }
    : defaultContextValue

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
