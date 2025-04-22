"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DollarTransferAnimation from "./DollarTransferAnimation"

interface LoadingDelayProps {
  children: React.ReactNode
  minimumLoadingTime?: number
  message?: string
  size?: "small" | "medium" | "large"
}

export default function LoadingDelay({
  children,
  minimumLoadingTime = 3000,
  message = "Loading...",
  size = "large",
}: LoadingDelayProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, minimumLoadingTime)

    return () => clearTimeout(timer)
  }, [minimumLoadingTime])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <DollarTransferAnimation message={message} size={size} dollarsCount={5} speed="normal" />
      </div>
    )
  }

  return <>{children}</>
}
