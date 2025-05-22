"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuthStatus } from "@/lib/auth-client"

// Define the AuthContext type
type AuthContextType = {
  user: any
  isLoading: boolean
  isAuthenticated: boolean
  refreshAuth: () => Promise<void>
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
})

// Export the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthStatus()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Export the useAuth hook
export function useAuth() {
  return useContext(AuthContext)
}
