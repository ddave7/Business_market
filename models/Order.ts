import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
        imageUrl: String,
      },
    ],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer"],
      default: "credit_card",
    },
    paymentDetails: {
      paymentIntentId: String,
      transactionId: String,
      cardBrand: String,
      cardLastFour: String,
      sessionId: {
        type: String,
        sparse: true, // This allows null values but enforces uniqueness when present
      },
    },
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    cancellationReason: String,
    cancelledAt: Date,
  },
  { timestamps: true },
)

// Add a compound unique index on user and sessionId
// This ensures a user can't have duplicate orders for the same session
OrderSchema.index(
  { user: 1, "paymentDetails.sessionId": 1 },
  {
    unique: true,
    sparse: true, // Allow null sessionId values
    partialFilterExpression: { "paymentDetails.sessionId": { $exists: true } }, // Only apply to documents with sessionId
  },
)

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
