"use client"

import { useEffect, useState } from "react"
import { DollarSign } from "lucide-react"

interface LoadingAnimationProps {
  message?: string
  size?: "small" | "medium" | "large"
}

export default function LoadingAnimation({ message = "Loading...", size = "medium" }: LoadingAnimationProps) {
  const [position, setPosition] = useState(0)

  // Animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => (prev + 1) % 3)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Size classes
  const sizeClasses = {
    small: {
      container: "h-16",
      hands: "w-8 h-8",
      dollar: "w-5 h-5",
      text: "text-sm",
    },
    medium: {
      container: "h-24",
      hands: "w-12 h-12",
      dollar: "w-8 h-8",
      text: "text-base",
    },
    large: {
      container: "h-32",
      hands: "w-16 h-16",
      dollar: "w-10 h-10",
      text: "text-lg",
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${classes.container} flex items-center justify-center mb-4`}>
        {/* Left hand */}
        <div
          className={`absolute ${classes.hands} left-1/2 transform -translate-x-[150%] bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300`}
        >
          <span className="transform -rotate-45">👋</span>
        </div>

        {/* Right hand */}
        <div
          className={`absolute ${classes.hands} left-1/2 transform translate-x-[50%] bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300`}
        >
          <span className="transform rotate-45">👋</span>
        </div>

        {/* Dollar bill */}
        <div
          className={`absolute ${classes.dollar} bg-green-500 rounded-md flex items-center justify-center text-white transition-all duration-300 ease-in-out border border-green-700`}
          style={{
            left: `calc(50% - ${classes.dollar.split(" ")[0]}/2)`,
            transform: `translateX(${(position - 1) * 50}%)`,
            opacity: position === 0 ? 0.5 : 1,
            scale: position === 0 ? "0.8" : "1",
          }}
        >
          <DollarSign className="w-full h-full p-1" />
        </div>
      </div>

      <p className={`text-center ${classes.text} text-gray-600`}>{message}</p>
    </div>
  )
}
