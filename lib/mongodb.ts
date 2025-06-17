import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    console.log("Using existing database connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log("Creating new database connection")
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("Connected to MongoDB")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("Failed to connect to MongoDB:", e)
    throw e
  }

  // Ensure models are imported after connection is established
  // This is just to make sure the models are registered
  require("@/models/User")
  require("@/models/Product")

  return cached.conn
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected")
})

process.on("SIGINT", async () => {
  await mongoose.connection.close()
  process.exit(0)
})
