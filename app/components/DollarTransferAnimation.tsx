"use client"

import { useEffect, useState } from "react"
import { DollarSign, Wallet, Landmark } from "lucide-react"

interface DollarTransferAnimationProps {
  message?: string
  size?: "small" | "medium" | "large"
  speed?: "slow" | "normal" | "fast"
  dollarsCount?: number
}

export default function DollarTransferAnimation({
  message = "Processing transaction...",
  size = "medium",
  speed = "normal",
  dollarsCount = 3,
}: DollarTransferAnimationProps) {
  const [dollars, setDollars] = useState<Array<{ id: number; position: number; delay: number }>>([])
  const [isVisible, setIsVisible] = useState(true)

  // Size classes
  const sizeClasses = {
    small: {
      container: "h-16",
      icons: "w-10 h-10",
      dollar: "w-5 h-5",
      text: "text-sm",
    },
    medium: {
      container: "h-24",
      icons: "w-14 h-14",
      dollar: "w-8 h-8",
      text: "text-base",
    },
    large: {
      container: "h-32",
      icons: "w-20 h-20",
      dollar: "w-10 h-10",
      text: "text-lg",
    },
  }

  // Speed settings
  const speedSettings = {
    slow: 1500,
    normal: 1000,
    fast: 600,
  }

  const classes = sizeClasses[size]
  const animationDuration = speedSettings[speed]

  // Initialize dollars
  useEffect(() => {
    const initialDollars = Array.from({ length: dollarsCount }, (_, i) => ({
      id: i,
      position: 0,
      delay: i * (animationDuration / dollarsCount),
    }))
    setDollars(initialDollars)

    // Animation loop
    const interval = setInterval(() => {
      setDollars((prev) =>
        prev.map((dollar) => ({
          ...dollar,
          position: (dollar.position + 1) % 4,
        })),
      )
    }, animationDuration)

    // Add a blinking effect to make the animation more noticeable
    const blinkInterval = setInterval(() => {
      setIsVisible((prev) => !prev)
    }, 500)

    return () => {
      clearInterval(interval)
      clearInterval(blinkInterval)
    }
  }, [dollarsCount, animationDuration])

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative ${classes.container} flex items-center justify-center mb-4 w-full max-w-xs`}>
        {/* Wallet on the left */}
        <div
          className={`absolute ${classes.icons} left-0 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary/20 z-10 ${
            isVisible ? "opacity-100" : "opacity-80"
          }`}
        >
          <Wallet className="w-3/4 h-3/4 text-primary" />
        </div>

        {/* Bank on the right */}
        <div
          className={`absolute ${classes.icons} right-0 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary/20 z-10 ${
            isVisible ? "opacity-100" : "opacity-80"
          }`}
        >
          <Landmark className="w-3/4 h-3/4 text-primary" />
        </div>

        {/* Dollar bills */}
        {dollars.map((dollar) => (
          <div
            key={dollar.id}
            className={`absolute ${classes.dollar} bg-green-500 rounded-md flex items-center justify-center text-white transition-all duration-${animationDuration}ms ease-in-out border border-green-700 z-0 ${
              isVisible ? "opacity-100" : "opacity-80"
            }`}
            style={{
              left: `${getPositionPercentage(dollar.position)}%`,
              transitionDelay: `${dollar.delay}ms`,
              opacity: getOpacity(dollar.position) * (isVisible ? 1 : 0.8),
              transform: `scale(${getScale(dollar.position)}) rotate(${getRotation(dollar.position)}deg)`,
              zIndex: dollar.position === 0 || dollar.position === 3 ? 0 : 5,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <DollarSign className="w-full h-full p-1" />
          </div>
        ))}
      </div>

      <p className={`text-center ${classes.text} text-muted-foreground animate-pulse font-medium`}>{message}</p>
    </div>
  )

  // Helper functions for animation
  function getPositionPercentage(position: number): number {
    switch (position) {
      case 0:
        return 5 // Starting at wallet (moved further left)
      case 1:
        return 30 // Moving right
      case 2:
        return 70 // Continuing right (increased spacing)
      case 3:
        return 95 // Ending at bank (moved further right)
      default:
        return 0
    }
  }

  function getOpacity(position: number): number {
    return position === 0 || position === 3 ? 0.5 : 1
  }

  function getScale(position: number): number {
    return position === 0 || position === 3 ? 0.8 : 1
  }

  function getRotation(position: number): number {
    switch (position) {
      case 0:
        return -15
      case 1:
        return -5
      case 2:
        return 5
      case 3:
        return 15
      default:
        return 0
    }
  }
}
