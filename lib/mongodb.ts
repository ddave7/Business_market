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
  try {
    if (cached.conn) {
      console.log("Using existing database connection")
      return cached.conn
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      }

      console.log("Creating new database connection")
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log("Connected to MongoDB")
        return mongoose
      })
    }

    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    cached.promise = null
    console.error("Failed to connect to MongoDB:", e)
    throw e
  }
}

export async function connectToDatabase() {
  try {
    if (cached.conn) {
      console.log("Using existing database connection")
      return { db: mongoose.connection.db }
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      }

      console.log("Creating new database connection")
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log("Connected to MongoDB")
        return mongoose
      })
    }

    cached.conn = await cached.promise
    return { db: mongoose.connection.db }
  } catch (e) {
    cached.promise = null
    console.error("Failed to connect to MongoDB:", e)
    throw e
  }
}

// Add connection event handlers
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected")
})

// Gracefully close the connection when the app is shutting down
process.on("SIGINT", async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
    console.log("MongoDB connection closed due to app termination")
  }
  process.exit(0)
})
