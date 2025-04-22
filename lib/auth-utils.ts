import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export async function getServerSideUser() {
  try {
    const token = cookies().get("auth_token")?.value

    if (!token) return null

    const verified = await jwtVerify(token, secretKey)
    return verified.payload
  } catch (error) {
    console.error("Error getting server side user:", error)
    return null
  }
}

export function getAuthToken() {
  return cookies().get("auth_token")?.value
}
