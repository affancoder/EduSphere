import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed",
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate purchases
PurchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
