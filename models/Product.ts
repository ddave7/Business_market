import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a product name"],
    trim: true,
    maxlength: [100, "Product name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a product description"],
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please add a product price"],
    min: [0, "Price cannot be negative"],
  },
  category: {
    type: String,
    required: [true, "Please add a product category"],
    enum: ["Electronics", "Clothing", "Food & Beverages", "Home & Garden", "Office Supplies", "Other"],
  },
  stock: {
    type: Number,
    required: [true, "Please add stock quantity"],
    min: [0, "Stock cannot be negative"],
  },
  imageUrl: {
    type: String,
    default: "/placeholder.svg",
    // Allow for longer URLs to accommodate data URLs
    maxlength: [1000000, "Image URL is too long"],
    // Add a setter to ensure URLs are properly formatted
    set: (url: string) => {
      // If it's a relative URL starting with /, make it absolute using the API URL
      if (url && url.startsWith("/") && process.env.NEXT_PUBLIC_API_URL) {
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`
      }
      return url
    },
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add text index for better search performance
productSchema.index({ name: "text", description: "text" })

// Add regular indexes for better query performance
productSchema.index({ category: 1 })
productSchema.index({ business: 1 })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })

// Use a safer way to check if model exists before creating it
export default mongoose.models.Product || mongoose.model("Product", productSchema)
