"use server"

import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function getBusinessProducts() {
  try {
    await connectDB()
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      console.error("Dashboard: No auth token found, redirecting to login")
      return { redirect: true, user: null, products: [] }
    }

    const user = await getUserFromToken({ headers: { cookie: `auth_token=${token}` } } as Request)

    if (!user) {
      console.error("Dashboard: No user found, redirecting to login")
      return { redirect: true, user: null, products: [] }
    }

    try {
      const products = await Product.find({ business: user._id }).sort({ createdAt: -1 }).limit(10).lean()
      console.log("Dashboard: Products fetched:", products.length)
      return {
        redirect: false,
        user,
        products: JSON.parse(JSON.stringify(products)),
      }
    } catch (error) {
      console.error("Error fetching business products:", error)
      // Return empty products array instead of throwing
      return {
        redirect: false,
        user,
        products: [],
        error: "Failed to fetch products",
      }
    }
  } catch (error) {
    console.error("Dashboard: Error in getBusinessProducts:", error)
    // Return a redirect flag instead of throwing
    return { redirect: true, user: null, products: [] }
  }
}
