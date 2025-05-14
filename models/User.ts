import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please add a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "business", "admin"],
    default: "business", // Changed default to business
  },
  isVerified: {
    type: Boolean,
    default: true, // Changed default to true
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
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

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    console.error("Error hashing password:", error)
    next(error)
  }
})

// Generate verification token
userSchema.methods.getVerificationToken = function () {
  // Generate token
  const token = crypto.randomBytes(20).toString("hex")

  // Hash token and set to verificationToken field
  this.verificationToken = crypto.createHash("sha256").update(token).digest("hex")

  // Set expiry
  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  return token
}

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password)
  } catch (error) {
    console.error("Error comparing passwords:", error)
    return false
  }
}

export default mongoose.models.User || mongoose.model("User", userSchema)
