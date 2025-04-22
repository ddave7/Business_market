"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import DollarTransferAnimation from "./DollarTransferAnimation"

export default function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Add event listeners for route changes
    window.addEventListener("routeChangeStart", handleStart)
    window.addEventListener("routeChangeComplete", handleComplete)
    window.addEventListener("routeChangeError", handleComplete)

    return () => {
      window.removeEventListener("routeChangeStart", handleStart)
      window.removeEventListener("routeChangeComplete", handleComplete)
      window.removeEventListener("routeChangeError", handleComplete)
    }
  }, [])

  // Also track pathname changes
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <DollarTransferAnimation message="Loading page..." size="large" dollarsCount={5} speed="fast" />
    </div>
  )
}
