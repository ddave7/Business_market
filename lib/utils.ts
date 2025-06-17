import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function retry<T>(operation: () => Promise<T>, retries = 3, delay = 1000, multiplier = 2): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries === 0) {
      throw error
    }
    console.log(`Retrying operation, ${retries} attempts left`)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return retry(operation, retries - 1, delay * multiplier, multiplier)
  }
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
