import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Product from "@/models/Product"
import bcrypt from "bcryptjs"

const dummyUsers = [
  {
    businessName: "TechGadgets Inc.",
    email: "contact@techgadgets.com",
    password: "password123",
    description: "Leading provider of cutting-edge electronics and gadgets.",
  },
  {
    businessName: "GreenLeaf Organics",
    email: "info@greenleaf.com",
    password: "organic2023",
    description: "Supplier of premium organic food and beverages.",
  },
  {
    businessName: "Office Solutions Pro",
    email: "sales@officesolutions.com",
    password: "office2023",
    description: "Your one-stop shop for all office supplies and furniture.",
  },
]

const dummyProducts = [
  {
    name: "Smart Watch X1",
    description: "Advanced smartwatch with health tracking and GPS.",
    price: 199.99,
    category: "Electronics",
    stock: 50,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Organic Green Tea",
    description: "Premium organic green tea, pack of 50 tea bags.",
    price: 12.99,
    category: "Food & Beverages",
    stock: 100,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Ergonomic Office Chair",
    description: "Comfortable ergonomic office chair with lumbar support.",
    price: 249.99,
    category: "Office Supplies",
    stock: 30,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Wireless Earbuds",
    description: "High-quality wireless earbuds with noise cancellation.",
    price: 129.99,
    category: "Electronics",
    stock: 75,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Organic Fruit Basket",
    description: "Assorted organic fruits, perfect for gifting or office snacks.",
    price: 39.99,
    category: "Food & Beverages",
    stock: 20,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Standing Desk Converter",
    description: "Convert any desk to a standing desk for better ergonomics.",
    price: 179.99,
    category: "Office Supplies",
    stock: 40,
    imageUrl: "/placeholder.svg?height=400&width=400",
  },
]

export async function POST(req: Request) {
  try {
    // Remove the authorization check
    // const authHeader = req.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Instead, add a simple warning log
    console.log("Warning: Seed API route is not protected by authentication")

    await connectDB()
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Product.deleteMany({})
    console.log("Cleared existing users and products")

    // Create users
    const createdUsers = await Promise.all(
      dummyUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        return User.create({ ...user, password: hashedPassword })
      }),
    )
    console.log(
      "Users created:",
      createdUsers.map((user) => user.businessName),
    )

    // Create products
    const createdProducts = await Promise.all(
      dummyProducts.map(async (product, index) => {
        const user = createdUsers[index % createdUsers.length]
        return Product.create({ ...product, business: user._id })
      }),
    )
    console.log(
      "Products created:",
      createdProducts.map((product) => product.name),
    )

    return NextResponse.json({ message: "Database seeded successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 })
  }
}
