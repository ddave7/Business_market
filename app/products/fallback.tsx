"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DollarTransferAnimation from "../components/DollarTransferAnimation"

export default function ProductsFallback() {
  const router = useRouter()

  useEffect(() => {
    // Use a simple timeout instead of relying on searchParams
    const redirectTimer = setTimeout(() => {
      router.push("/products/client-page")
    }, 1000)

    return () => clearTimeout(redirectTimer)
  }, [router])

  return (
    <div className="text-center py-12">
      <DollarTransferAnimation message="Redirecting to products..." />
    </div>
  )
}
