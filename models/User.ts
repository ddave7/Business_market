import mongoose from "mongoose"
import bcrypt from "bcryptjs"

// Check if the model already exists to prevent recompilation errors
const userSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, "Please add a business name"],
    trim: true,
    minlength: [2, "Business name must be at least 2 characters long"],
    maxlength: [50, "Business name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "Password must be at least 6 characters long"],
    select: false,
  },
  description: {
    type: String,
    required: [true, "Please add a business description"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Use a safer way to check if model exists before creating it
export default mongoose.models.User || mongoose.model("User", userSchema)
