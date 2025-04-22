"use client"

import type React from "react"

import { useEffect, useState } from "react"
import DollarTransferAnimation from "./DollarTransferAnimation"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
  delay?: number // Delay in ms before showing the overlay
  minDuration?: number // Minimum duration to show the overlay
}

export default function LoadingOverlay({
  isLoading,
  message,
  children,
  delay = 300,
  minDuration = 0,
}: LoadingOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayStartTime, setOverlayStartTime] = useState<number | null>(null)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isLoading) {
      timeout = setTimeout(() => {
        setShowOverlay(true)
        setOverlayStartTime(Date.now())
      }, delay)
    } else if (overlayStartTime !== null) {
      // Calculate how long the overlay has been shown
      const elapsedTime = Date.now() - overlayStartTime

      // If it hasn't been shown for the minimum duration, keep it visible
      if (elapsedTime < minDuration) {
        timeout = setTimeout(() => {
          setShowOverlay(false)
          setOverlayStartTime(null)
        }, minDuration - elapsedTime)
      } else {
        setShowOverlay(false)
        setOverlayStartTime(null)
      }
    } else {
      setShowOverlay(false)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isLoading, delay, minDuration, overlayStartTime])

  return (
    <div className="relative">
      {children}

      {showOverlay && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg shadow-lg">
          <DollarTransferAnimation message={message} size="medium" dollarsCount={5} />
        </div>
      )}
    </div>
  )
}
