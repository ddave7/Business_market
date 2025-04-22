"use client"

import { useState } from "react"

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg?height=200&width=200")

  const handleError = () => {
    console.error(`Error loading image: ${src}`)
    setImgSrc("/placeholder.svg?height=200&width=200")
  }

  return <img src={imgSrc || "/placeholder.svg"} alt={alt} className={className} onError={handleError} />
}
